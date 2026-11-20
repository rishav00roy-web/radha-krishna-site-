import "server-only";
import { cache } from "react";
import { createPublicClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import {
  seedFacilities, seedGallery, seedLocation, seedMedia, seedMilestones, seedOrganisation,
} from "./seed";
import type {
  Announcement, EventItem, Facility, GalleryItem, LocationInfo, Milestone, Organisation, ProjectUpdate, SiteMedia,
} from "./types";

/**
 * Public content reads. Without Supabase (local preview) or on a read error,
 * the honest seed content is shown so the site never renders broken.
 */
async function read<T>(fallback: T, query: (db: ReturnType<typeof createPublicClient>) => PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    const { data, error } = await query(createPublicClient());
    if (error || data == null) {
      if (error) console.error("[data]", error);
      return fallback;
    }
    return data as T;
  } catch (err) {
    console.error("[data]", err);
    return fallback;
  }
}

async function setting<T>(key: string, fallback: T): Promise<T> {
  const row = await read<{ value: T } | null>(null, (db) =>
    db.from("site_settings").select("value").eq("key", key).maybeSingle(),
  );
  return row?.value ? { ...fallback, ...row.value } : fallback;
}

export const getFacilities = cache(() =>
  read<Facility[]>(seedFacilities, (db) => db.from("facilities").select("*").eq("published", true).order("sort")),
);

export const getMilestones = cache(() =>
  read<Milestone[]>(seedMilestones, (db) => db.from("milestones").select("id, step, title, description, status, verified, verified_on").order("step")),
);

export const getGallery = cache(() =>
  read<GalleryItem[]>(seedGallery, (db) => db.from("gallery_items").select("*").eq("published", true).order("sort")),
);

export const getEvents = cache(() =>
  read<EventItem[]>([], (db) => db.from("events").select("*").eq("published", true).order("starts_at")),
);

export const getAnnouncements = cache(() =>
  read<Announcement[]>([], (db) =>
    db.from("announcements").select("*").eq("published", true)
      .order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(20),
  ),
);

export const getUpdates = cache(() =>
  read<ProjectUpdate[]>([], (db) =>
    db.from("project_updates").select("*").eq("published", true).order("published_at", { ascending: false }),
  ),
);

export const getUpdate = cache(async (slug: string) =>
  read<ProjectUpdate | null>(null, (db) =>
    db.from("project_updates").select("*").eq("published", true).eq("slug", slug).maybeSingle(),
  ),
);

export const getOrganisation = cache(() => setting<Organisation>("organisation", seedOrganisation));
export const getLocation = cache(() => setting<LocationInfo>("location", seedLocation));
export const getMedia = cache(() => setting<SiteMedia>("media", seedMedia));
