"use client";

import { useState } from "react";

/** Two-step delete: the first click asks, the second submits the surrounding form. */
export function DeleteButton({ label }: { label: string }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="inline-flex flex-wrap items-center gap-4">
      <span>This cannot be undone.</span>
      <button type="submit" className="btn !min-h-[40px] bg-[#b3261e] !py-1.5 text-white hover:bg-[#8c1d17]">Yes, delete</button>
      <button type="button" onClick={() => setArmed(false)} className="underline">Cancel</button>
    </span>
  ) : (
    <button type="button" onClick={() => setArmed(true)} className="text-[#b3261e] underline">{label}</button>
  );
}
