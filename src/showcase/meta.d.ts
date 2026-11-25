export type Status = "in-use" | "passed" | "fix" | "failed" | "untested";
export const components: { slug: string; name: string; status: Status; note: string }[];
export const statusLabel: Record<Status, string>;
