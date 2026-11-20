import type { Locale } from "@/i18n/config";

export const routes = {
  home: "",
  temple: "/temple",
  architecture: "/architecture",
  masterPlan: "/master-plan",
  activities: "/activities",
  environment: "/environment",
  journey: "/journey",
  gallery: "/gallery",
  location: "/location",
  organisation: "/organisation",
  contact: "/contact",
} as const;
export type RouteKey = keyof typeof routes;

export const href = (locale: Locale, key: RouteKey) => `/${locale}${routes[key]}`;
