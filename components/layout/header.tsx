"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/ui/button";

const TITLE_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/create": "Create Post",
  "/channels": "Channels & API Monitor",
  "/accounts": "Channels & API Monitor",
  "/scheduled": "Scheduled Posts",
  "/publish": "Scheduled Posts",
  "/published": "Publishing History",
  "/drafts": "Drafts",
  "/analytics": "Analytics Command Center",
  "/media": "Media Library",
  "/settings": "Settings & Security",
  "/login": "Security & Login",
};

export function Header() {
  const pathname = usePathname();
  const pageTitle = TITLE_MAP[pathname] || "Fubber";

  return (
    <header className="h-14 px-6 md:px-8 border-b border-border bg-background flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />

        {pathname !== "/create" && (
          <Link href="/create">
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs font-semibold px-3.5 bg-sky-500 hover:bg-sky-600 text-white shadow-none transition-colors"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>New Post</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
