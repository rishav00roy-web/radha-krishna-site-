"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import { SubmitBar } from "./RecordForm";

/** Thin wrapper so server-rendered settings fields can post through a server action with status feedback. */
export function SettingsForm({ action, children }: { action: (prev: FormState, form: FormData) => Promise<FormState>; children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-6">
      {children}
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
