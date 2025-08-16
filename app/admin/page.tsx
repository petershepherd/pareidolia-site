// app/admin/page.tsx
import { redirect } from "next/navigation";

// Szerver oldali azonnali átirányítás az admin fő nézetre
export default function AdminIndex() {
  redirect("/admin/contest");
}
