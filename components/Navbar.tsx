"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Navbar() { return <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border/70 bg-background/90 px-6 backdrop-blur-xl lg:px-10"><div><p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">DentalAI workspace</p><h2 className="mt-1 text-lg font-bold tracking-tight text-slate-800">Clinic command center</h2></div><div className="flex items-center gap-3"><div className="relative hidden md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search patients or appointments" className="h-10 w-72 rounded-xl border-border bg-white pl-10 shadow-sm" /></div><button type="button" aria-label="Notifications" className="grid size-10 place-items-center rounded-xl border border-border bg-white text-slate-600 shadow-sm hover:bg-muted"><Bell className="size-5" /></button><Avatar className="size-10 shadow-sm"><AvatarFallback className="bg-primary font-semibold text-primary-foreground">DR</AvatarFallback></Avatar></div></header>; }
