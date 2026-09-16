"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Clean standalone layout for login / authentication screen
  if (pathname === "/login") {
    return (
      <main className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar - optimized for Tablet, Laptop, Desktop, and TV displays */}
      <div className="shrink-0 flex">
        <Sidebar />
      </div>

      {/* Main Content Area - with sensible containment on ultra-wide & TV displays */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className="max-w-7xl 2xl:max-w-[1500px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
