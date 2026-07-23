import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth";
export default function LogoutButton() { async function logout() { "use server"; await destroySession(); redirect("/login"); } return <form action={logout}><button className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">Sign out</button></form>; }
