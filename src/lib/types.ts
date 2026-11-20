import type { Localized } from "@/i18n/config";

export type FacilityStatus = "proposed" | "under_construction" | "completed";
export type MilestoneStatus = "planned" | "in_progress" | "completed";
export type Role = "super_admin" | "admin" | "editor" | "viewer";

export const galleryCategories = [
  "architecture",
  "art",
  "masterplan",
  "sarovar",
  "gaushala",
  "bamboo",
  "medicinal",
  "fruit",
  "updates",
] as const;
export type GalleryCategory = (typeof galleryCategories)[number];

export const iconKeys = [
  "temple", "cow", "water", "bamboo", "herb", "fruit", "meditate", "gathering",
  "lotus", "feather", "flute", "diya", "kalash", "book", "drum", "hands", "tree", "conch",
] as const;
export type IconKey = (typeof iconKeys)[number];

export type Facility = {
  id: string;
  code: string;
  slug: string;
  name: Localized;
  summary: Localized;
  description: Localized;
  status: FacilityStatus;
  icon: IconKey;
  pos_x: number;
  pos_y: number;
  image_url: string | null;
  sort: number;
};

export type EventItem = {
  id: string;
  title: Localized;
  description: Localized;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
};

export type Announcement = {
  id: string;
  title: Localized;
  body: Localized;
  published_at: string;
  pinned: boolean;
};

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  title: Localized;
  caption: Localized;
  media_type: "image" | "video";
  url: string | null;
  thumbnail_url: string | null;
  is_placeholder: boolean;
  sort: number;
};

export type Milestone = {
  id: string;
  step: number;
  title: Localized;
  description: Localized;
  status: MilestoneStatus;
  verified: boolean;
  verified_on: string | null;
};

export type ProjectUpdate = {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  cover_url: string | null;
  published_at: string;
};

export type Organisation = {
  name: string;
  short_name: string;
  legal_form: string;
  cin: string;
  pan: string;
  csr: string;
  darpan: string;
  address: string;
  phone: string;
  email: string | null;
  leader_name: string;
  leader_title: string;
};

export type LocationInfo = {
  lat: number | null;
  lng: number | null;
  directions: Localized | null;
  landmarks: Localized[];
};

export type SiteMedia = {
  hero_image: string | null;
  masterplan_image: string | null;
  logo: string | null;
};
