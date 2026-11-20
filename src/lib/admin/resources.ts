import type { Role } from "../types";
import { galleryCategories, iconKeys } from "../types";

export type Field =
  | { name: string; label: string; type: "text" | "slug"; required?: boolean; help?: string }
  | { name: string; label: string; type: "localized"; multiline?: boolean; required?: boolean; help?: string }
  | { name: string; label: string; type: "textarea"; help?: string }
  | { name: string; label: string; type: "number"; step?: string; min?: number; max?: number; required?: boolean; help?: string }
  | { name: string; label: string; type: "datetime" | "date"; required?: boolean; help?: string }
  | { name: string; label: string; type: "boolean"; help?: string }
  | { name: string; label: string; type: "select"; options: readonly string[]; required?: boolean; help?: string }
  | { name: string; label: string; type: "media"; accept: string; help?: string };

export type Resource = {
  table: string;
  label: string;
  singular: string;
  minRole: Role;
  order: { column: string; ascending: boolean };
  columns: { name: string; label: string; kind?: "localized" | "date" | "boolean" }[];
  fields: Field[];
  help?: string;
};

const defs = {
  facilities: {
    table: "facilities",
    label: "Master plan facilities",
    singular: "facility",
    minRole: "editor",
    order: { column: "sort", ascending: true },
    help: "Each facility appears on the interactive master plan at its X/Y position (percent from the left and top). Keep the status at 'proposed' until construction is verified.",
    columns: [
      { name: "code", label: "Code" },
      { name: "name", label: "Name", kind: "localized" },
      { name: "status", label: "Status" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "code", label: "Code (A, B, C…)", type: "text", required: true },
      { name: "slug", label: "Slug", type: "slug", required: true, help: "Lowercase words joined by hyphens, used in links." },
      { name: "name", label: "Name", type: "localized", required: true },
      { name: "summary", label: "Summary", type: "localized" },
      { name: "description", label: "Description", type: "localized", multiline: true },
      { name: "status", label: "Status", type: "select", options: ["proposed", "under_construction", "completed"], required: true },
      { name: "icon", label: "Icon", type: "select", options: iconKeys, required: true },
      { name: "pos_x", label: "Plan position X (%)", type: "number", step: "0.1", min: 0, max: 100, required: true },
      { name: "pos_y", label: "Plan position Y (%)", type: "number", step: "0.1", min: 0, max: 100, required: true },
      { name: "image_url", label: "Image", type: "media", accept: "image/*" },
      { name: "sort", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  events: {
    table: "events",
    label: "Events",
    singular: "event",
    minRole: "editor",
    order: { column: "starts_at", ascending: false },
    help: "Times are in India Standard Time.",
    columns: [
      { name: "title", label: "Title", kind: "localized" },
      { name: "starts_at", label: "Starts", kind: "date" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "description", label: "Description", type: "localized", multiline: true },
      { name: "starts_at", label: "Starts", type: "datetime", required: true },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  announcements: {
    table: "announcements",
    label: "Announcements",
    singular: "announcement",
    minRole: "editor",
    order: { column: "published_at", ascending: false },
    columns: [
      { name: "title", label: "Title", kind: "localized" },
      { name: "published_at", label: "Date", kind: "date" },
      { name: "pinned", label: "Pinned", kind: "boolean" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "body", label: "Text", type: "localized", multiline: true },
      { name: "published_at", label: "Date", type: "datetime", required: true },
      { name: "pinned", label: "Pin to top", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  gallery: {
    table: "gallery_items",
    label: "Gallery and designs",
    singular: "gallery item",
    minRole: "editor",
    order: { column: "sort", ascending: true },
    help: "Upload architectural renders under 'architecture' and the master-plan drawing under 'masterplan'. For video, upload an MP4 or paste a YouTube link.",
    columns: [
      { name: "title", label: "Title", kind: "localized" },
      { name: "category", label: "Category" },
      { name: "media_type", label: "Type" },
      { name: "is_placeholder", label: "Placeholder", kind: "boolean" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "category", label: "Category", type: "select", options: galleryCategories, required: true },
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "caption", label: "Caption", type: "localized" },
      { name: "media_type", label: "Media type", type: "select", options: ["image", "video"], required: true },
      { name: "url", label: "Image or video", type: "media", accept: "image/*,video/mp4,video/webm", help: "Or paste a YouTube link." },
      { name: "thumbnail_url", label: "Thumbnail (for videos)", type: "media", accept: "image/*" },
      { name: "is_placeholder", label: "This is a placeholder", type: "boolean", help: "Untick once a real image is uploaded." },
      { name: "sort", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  milestones: {
    table: "milestones",
    label: "Construction progress",
    singular: "milestone",
    minRole: "admin",
    order: { column: "step", ascending: true },
    help: "A stage can only be marked 'in progress' or 'completed' once it is verified. Record what the verification was based on.",
    columns: [
      { name: "step", label: "Step" },
      { name: "title", label: "Stage", kind: "localized" },
      { name: "status", label: "Status" },
      { name: "verified", label: "Verified", kind: "boolean" },
    ],
    fields: [
      { name: "step", label: "Step", type: "number", required: true },
      { name: "title", label: "Stage", type: "localized", required: true },
      { name: "description", label: "Description", type: "localized", multiline: true },
      { name: "status", label: "Status", type: "select", options: ["planned", "in_progress", "completed"], required: true },
      { name: "verified", label: "Verified", type: "boolean" },
      { name: "verified_on", label: "Verified on", type: "date" },
      { name: "evidence_note", label: "Verification evidence (internal)", type: "textarea", help: "Not shown publicly. For example: approval letter no., site inspection date." },
    ],
  },
  updates: {
    table: "project_updates",
    label: "Project updates",
    singular: "update",
    minRole: "editor",
    order: { column: "published_at", ascending: false },
    columns: [
      { name: "title", label: "Title", kind: "localized" },
      { name: "published_at", label: "Date", kind: "date" },
      { name: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "slug", required: true },
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "excerpt", label: "Summary", type: "localized" },
      { name: "body", label: "Full text", type: "localized", multiline: true },
      { name: "cover_url", label: "Cover image", type: "media", accept: "image/*" },
      { name: "published_at", label: "Date", type: "datetime", required: true },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
} satisfies Record<string, Resource>;

export type ResourceKey = keyof typeof defs;
export const resources: Record<ResourceKey, Resource> = defs;
export const isResource = (k: string): k is ResourceKey => k in resources;
