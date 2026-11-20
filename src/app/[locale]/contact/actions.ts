"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ContactState = {
  status: "idle" | "success" | "error" | "not_configured";
  errors?: Partial<Record<"name" | "email" | "mobile" | "subject" | "message", "required" | "email" | "mobile">>;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  mobile: z.string().trim().regex(/^(\+?91[\s-]?)?[6-9]\d{9}$/),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(4000),
});

export async function submitEnquiry(_prev: ContactState, form: FormData): Promise<ContactState> {
  const values = Object.fromEntries(["name", "email", "mobile", "subject", "message"].map((k) => [k, String(form.get(k) ?? "")]));

  // Honeypot: real visitors never fill the hidden field.
  if (String(form.get("website") ?? "")) return { status: "success" };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["errors"]>;
      errors[key] = !values[key]?.trim() ? "required" : key === "email" ? "email" : key === "mobile" ? "mobile" : "required";
    }
    return { status: "error", errors, values };
  }

  if (!isSupabaseConfigured) return { status: "not_configured", values };

  const h = await headers();
  const { error } = await createPublicClient().from("enquiries").insert({
    ...parsed.data,
    locale: String(form.get("locale") ?? "en").slice(0, 2),
    user_agent: (h.get("user-agent") ?? "").slice(0, 300),
  });
  if (error) {
    console.error("[contact]", error);
    return { status: "error", values };
  }
  return { status: "success" };
}
