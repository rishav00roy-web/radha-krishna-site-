import type { FacilityStatus } from "@/lib/types";
import type { Dictionary } from "@/i18n";

export function StatusTag({ status, dict }: { status: FacilityStatus; dict: Dictionary }) {
  const label =
    status === "completed" ? dict.common.completed : status === "under_construction" ? dict.common.underConstruction : dict.common.proposed;
  return <span className="proposed-tag">{label}</span>;
}
