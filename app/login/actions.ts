"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
export async function loginAction(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const user = await prisma.user.findUnique({ where: { email } }); if (!user || !user.active || !verifyPassword(password, user.passwordHash)) redirect("/login?error=invalid"); await createSession(user.id); redirect("/dashboard"); }
