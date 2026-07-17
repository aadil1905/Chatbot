"use client";

import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Welcome to DentalAI Clinic Management
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search..."
            className="pl-10 w-64"
          />
        </div>

        <Bell className="cursor-pointer text-gray-600" size={22} />

        <Avatar>
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}