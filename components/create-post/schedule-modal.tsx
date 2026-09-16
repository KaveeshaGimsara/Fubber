"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Globe,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/dialog";
import { Button } from "@/ui/button";

const COMMON_TIMEZONES = [
  { value: "Asia/Colombo", label: "Asia/Colombo (GMT+5:30)" },
  { value: "UTC", label: "UTC (GMT+0:00)" },
  { value: "America/New_York", label: "America/New York (Eastern)" },
  { value: "America/Chicago", label: "America/Chicago (Central)" },
  { value: "America/Denver", label: "America/Denver (Mountain)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (Pacific)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
];

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSchedule: (scheduledDate: Date, timezone: string) => void;
  isSubmitting?: boolean;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirmSchedule,
  isSubmitting,
}: ScheduleModalProps) {
  const getInitialDate = () => {
    const d = new Date();
    d.setHours(d.getHours() + 3);
    d.setMinutes(0);
    return d.toISOString().slice(0, 16);
  };

  const detectedTz =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Colombo";

  const [dateTime, setDateTime] = useState<string>(getInitialDate());
  const [selectedTz, setSelectedTz] = useState<string>(
    COMMON_TIMEZONES.some((tz) => tz.value === detectedTz) ? detectedTz : "Asia/Colombo"
  );

  const applyPreset = (presetType: "today_evening" | "tomorrow_morning" | "tomorrow_evening") => {
    const target = new Date();
    if (presetType === "today_evening") {
      target.setHours(18, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
    } else if (presetType === "tomorrow_morning") {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (presetType === "tomorrow_evening") {
      target.setDate(target.getDate() + 1);
      target.setHours(19, 30, 0, 0);
    }
    setDateTime(target.toISOString().slice(0, 16));
  };

  const selectedDate = new Date(dateTime);
  const isValidDate = !isNaN(selectedDate.getTime());
  const isFuture = isValidDate && selectedDate.getTime() > Date.now();

  const handleConfirm = () => {
    if (!isFuture) return;
    onConfirmSchedule(selectedDate, selectedTz);
  };

  // Human readable format for requirement #13
  const formattedDate = isValidDate
    ? selectedDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const formattedTime = isValidDate
    ? selectedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold">Schedule Post</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Automate serverless publishing at your selected future date and timezone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Quick recommendations */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Recommended Times
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset("today_evening")}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                  <Clock className="h-3 w-3 text-sky-600" />
                  <span>Today 6:00 PM</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Peak engagement
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("tomorrow_morning")}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                  <Clock className="h-3 w-3 text-sky-600" />
                  <span>Tomorrow 9:00 AM</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Morning slot
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("tomorrow_evening")}
                className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                  <Clock className="h-3 w-3 text-sky-600" />
                  <span>Tomorrow 7:30 PM</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  Evening slot
                </span>
              </button>
            </div>
          </div>

          {/* Custom Date & Time input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {isValidDate && !isFuture && (
              <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Scheduled time must be in the future.</span>
              </p>
            )}
          </div>

          {/* Timezone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Timezone</span>
            </label>
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-foreground"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Explicit Confirmation Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Scheduled for
            </span>
            <div className="font-semibold text-slate-900 dark:text-white">
              {formattedDate}
            </div>
            <div className="text-sky-600 dark:text-sky-400 font-medium">
              {formattedTime}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {selectedTz}
            </div>
          </div>

          {/* 1-hour media auto-delete note */}
          <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
            <span className="font-semibold text-sky-700 dark:text-sky-300">Serverless storage policy:</span> Images auto-purge 1 hour after successful execution to keep your database lean.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-8 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={!isFuture || isSubmitting}
            className="text-xs h-8 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-none"
          >
            {isSubmitting ? "Scheduling..." : "Confirm Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
