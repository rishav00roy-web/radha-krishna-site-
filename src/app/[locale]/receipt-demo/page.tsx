import type { Metadata } from "next";
import { Suspense } from "react";
import { getOrganisation } from "@/lib/data";
import { ReceiptDemo } from "@/components/ReceiptDemo";

export const metadata: Metadata = {
  title: "Sample acknowledgement and receipt (demo)",
  robots: { index: false, follow: false },
};

/** Demo of the receipt flow: what a visitor is sent at once, and what the foundation issues after payment. */
export default function ReceiptDemoPage() {
  const org = getOrganisation();
  return (
    <Suspense>
      <ReceiptDemo
        org={{ name: org.name, address: org.address, cin: org.cin, pan: org.pan, csr: org.csr, darpan: org.darpan, eightyG: org.eighty_g, phone: org.phone, email: org.email }}
      />
    </Suspense>
  );
}
