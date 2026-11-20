import {
  announcements, events, facilities, gallery, location, milestones, organisation, updates,
} from "./content";

/** Content accessors. Everything is static and lives in ./content.ts. */
export const getFacilities = () => [...facilities].sort((a, b) => a.sort - b.sort);
export const getMilestones = () => [...milestones].sort((a, b) => a.step - b.step);
export const getGallery = () => [...gallery].sort((a, b) => a.sort - b.sort);
export const getEvents = () => [...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
export const getAnnouncements = () =>
  [...announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.published_at.localeCompare(a.published_at));
export const getUpdates = () => [...updates].sort((a, b) => b.published_at.localeCompare(a.published_at));
export const getUpdate = (slug: string) => updates.find((u) => u.slug === slug) ?? null;
export const getOrganisation = () => organisation;
export const getLocation = () => location;
