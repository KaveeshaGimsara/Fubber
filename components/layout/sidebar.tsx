"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Radio,
  CheckCircle2,
  FileText,
  BarChart3,
  Image as ImageIcon,
  Settings,
  Calendar,
  ChevronsUpDown,
} from "lucide-react";
import { FubberWordmark } from "@/components/icons/fubber-logo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create", label: "Create Post", icon: Plus, isAction: true },
  { href: "/channels", label: "Channels", icon: Radio },
  { href: "/scheduled", label: "Scheduled", icon: Calendar },
  { href: "/published", label: "Published", icon: CheckCircle2 },
  { href: "/drafts", label: "Drafts", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/media", label: "Media Library", icon: ImageIcon },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-zinc-950 h-screen flex flex-col justify-between shrink-0 select-none z-30">
      <div className="p-4 space-y-4">
        {/* Brand Header */}
        <div className="h-10 px-1 flex items-center">
          <Link href="/" onClick={onNavigate}>
            <FubberWordmark />
          </Link>
        </div>

        {/* Primary Sky Blue Action Button */}
        <div>
          <Link href="/create" onClick={onNavigate}>
            <button className="w-full h-10 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create Post</span>
            </button>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1 pt-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-100 dark:border-sky-900/50"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-400 dark:text-zinc-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Organization Footer & Security Quick Access */}
      <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800">
        <Link
          href="/login"
          onClick={onNavigate}
          title="Manage Session & 2FA Login"
          className="p-2 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-800"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-full h-full rounded-[6px] bg-white dark:bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-sky-600 dark:text-sky-400">
                F
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                Fubber Workspace
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-tight">
                Security & 2FA Login
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
