import { redirect } from "next/navigation";

/** @deprecated Internal test route retained only for legacy links. */
export default function LegacyTestPage() {
  redirect("/dashboard/appointments");
}
