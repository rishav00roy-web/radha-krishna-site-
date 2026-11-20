"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { isResource, resources, type Field, type ResourceKey } from "@/lib/admin/resources";
import { fromIstInput } from "@/lib/admin/time";
import type { Role } from "@/lib/types";

export type FormState = { error?: string; ok?: string };

const MAX_UPLOAD = 50 * 1024 * 1024;

/** Upload to the public "media" bucket under the signed-in user's session (storage RLS applies). */
async function upload(folder: string, file: File): Promise<string> {
  if (file.size > MAX_UPLOAD) throw new Error("File is larger than 50 MB.");
  if (!/^(image|video)\//.test(file.type)) throw new Error("Only image or video files can be uploaded.");
  const db = await createSessionClient();
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-80);
  const path = `${folder}/${randomUUID()}-${safe}`;
  const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return db.storage.from("media").getPublicUrl(path).data.publicUrl;
}

async function readField(field: Field, form: FormData, folder: string): Promise<unknown> {
  const s = (k: string) => String(form.get(k) ?? "").trim();
  switch (field.type) {
    case "localized":
      return { en: s(`${field.name}.en`), as: s(`${field.name}.as`), hi: s(`${field.name}.hi`) };
    case "boolean":
      return form.get(field.name) === "on";
    case "number":
      return s(field.name) === "" ? null : Number(s(field.name));
    case "datetime":
      return fromIstInput(s(field.name));
    case "date":
      return s(field.name) || null;
    case "slug":
      return s(field.name).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    case "media": {
      const file = form.get(`${field.name}__file`);
      if (file instanceof File && file.size > 0) return upload(folder, file);
      return s(field.name) || null;
    }
    default:
      return s(field.name) || null;
  }
}

function missingRequired(field: Field, value: unknown) {
  if (!("required" in field) || !field.required) return false;
  if (field.type === "localized") return !(value as { en: string }).en;
  return value === null || value === "";
}

export async function saveRecord(key: string, id: string, _prev: FormState, form: FormData): Promise<FormState> {
  if (!isResource(key)) return { error: "Unknown section." };
  const res = resources[key as ResourceKey];
  await requireRole(res.minRole as Role);

  const row: Record<string, unknown> = {};
  try {
    for (const field of res.fields) {
      const value = await readField(field, form, key);
      if (missingRequired(field, value)) return { error: `${field.label} is required${field.type === "localized" ? " (at least in English)" : ""}.` };
      row[field.name] = value;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not read the form." };
  }

  const db = await createSessionClient();
  const query = id === "new" ? db.from(res.table).insert(row).select("id").single() : db.from(res.table).update(row).eq("id", id).select("id").single();
  const { data, error } = await query;
  if (error) {
    if (error.code === "23514") return { error: "Not saved: a stage can only be 'in progress' or 'completed' after it is marked verified." };
    if (error.code === "23505") return { error: "Not saved: that slug or code is already used." };
    if (error.code === "42501" || error.code === "PGRST116") return { error: "Not saved: your role does not allow this change." };
    return { error: `Not saved: ${error.message}` };
  }
  revalidatePath("/", "layout");
  if (id === "new") redirect(`/admin/${key}/${data.id}?saved=1`);
  return { ok: "Saved. The public site is updated." };
}

export async function deleteRecord(key: string, id: string): Promise<void> {
  if (!isResource(key)) return;
  const res = resources[key as ResourceKey];
  await requireRole(res.minRole === "editor" ? "editor" : "admin");
  const db = await createSessionClient();
  await db.from(res.table).delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/${key}?deleted=1`);
}

/* ---------- Settings: organisation, location, media ---------- */

export async function saveSetting(key: "organisation" | "location" | "media", _prev: FormState, form: FormData): Promise<FormState> {
  await requireRole("admin");
  const s = (k: string) => String(form.get(k) ?? "").trim();
  let value: Record<string, unknown>;
  try {
    if (key === "organisation") {
      value = Object.fromEntries(
        ["name", "short_name", "legal_form", "cin", "pan", "csr", "darpan", "address", "phone", "email", "leader_name", "leader_title"].map((k) => [k, s(k) || null]),
      );
      if (!value.name || !value.phone) return { error: "Name and phone are required." };
    } else if (key === "location") {
      const lat = s("lat") ? Number(s("lat")) : null;
      const lng = s("lng") ? Number(s("lng")) : null;
      if ((lat === null) !== (lng === null)) return { error: "Enter both latitude and longitude, or neither." };
      if (lat !== null && (Math.abs(lat) > 90 || Math.abs(lng!) > 180 || Number.isNaN(lat) || Number.isNaN(lng))) return { error: "Coordinates are out of range." };
      if (lat !== null && form.get("verified") !== "on") return { error: "Tick the box to confirm the coordinates are verified." };
      const directions = { en: s("directions.en"), as: s("directions.as"), hi: s("directions.hi") };
      const landmarks = ["en", "as", "hi"].map((l) => s(`landmarks.${l}`).split("\n").map((x) => x.trim()).filter(Boolean));
      const count = Math.max(...landmarks.map((x) => x.length));
      value = {
        lat, lng,
        directions: directions.en ? directions : null,
        landmarks: Array.from({ length: count }, (_, i) => ({ en: landmarks[0][i] ?? "", as: landmarks[1][i] ?? "", hi: landmarks[2][i] ?? "" })).filter((x) => x.en),
      };
    } else {
      value = {};
      for (const f of ["hero_image", "masterplan_image", "logo"]) {
        const file = form.get(`${f}__file`);
        value[f] = file instanceof File && file.size > 0 ? await upload("site", file) : s(f) || null;
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not read the form." };
  }
  const db = await createSessionClient();
  const { error } = await db.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return { error: `Not saved: ${error.message}` };
  revalidatePath("/", "layout");
  return { ok: "Saved. The public site is updated." };
}

/* ---------- Enquiries ---------- */

export async function setEnquiryStatus(id: string, status: "new" | "in_progress" | "closed") {
  await requireRole("admin");
  const db = await createSessionClient();
  await db.from("enquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/enquiries");
}

/* ---------- Users ---------- */

export async function setUserRole(id: string, role: Role) {
  const me = await requireRole("super_admin");
  if (id === me.id) return; // Avoid locking yourself out.
  const db = await createSessionClient();
  await db.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}

/* ---------- Auth ---------- */

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  const db = await createSessionClient();
  const { error } = await db.auth.signInWithPassword({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
  if (error) return { error: "Email or password is incorrect." };
  redirect("/admin");
}

export async function signOut() {
  const db = await createSessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}
