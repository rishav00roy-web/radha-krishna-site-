import { redirect } from "next/navigation";
export default async function DirectionsIndex({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/directions/a`);
}
