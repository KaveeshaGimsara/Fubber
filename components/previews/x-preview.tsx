import React from "react";
import { MessageSquare, Repeat2, Heart, Bookmark, Share, MoreHorizontal, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface XPreviewProps {
  displayName?: string;
  handle?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
}

export function XPreview({
  displayName = "Fubber",
  handle = "fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: XPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[500px] mx-auto bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 font-sans text-sm shadow-sm">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback className="bg-sky-500 text-white">
            <FubberLogo className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>

        <div className="grow">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                {displayName}
              </span>
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500 text-white">
                <Check className="h-2 w-2 stroke-[3]" />
              </span>
              <span className="text-zinc-500 text-xs">@{handle}</span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-zinc-500 text-xs">Just now</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Tweet Caption */}
          <div className="mt-1 text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed whitespace-pre-line">
            {caption || <span className="text-zinc-400 italic">What is happening?!</span>}
          </div>

          {/* Media Card */}
          {imageUrl ? (
            <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="X preview"
                className="w-full max-h-[380px] object-cover"
              />
            </div>
          ) : (
            <div className="mt-3 h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs border border-zinc-200 dark:border-zinc-800">
              Upload an image to preview
            </div>
          )}

          {/* Tweet stats row */}
          <div className="mt-3 flex items-center justify-between text-zinc-500 text-xs max-w-[340px]">
            <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
              <Repeat2 className="h-3.5 w-3.5" />
              <span>0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
              <Heart className="h-3.5 w-3.5" />
              <span>0</span>
            </button>
            <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
              <Bookmark className="h-3.5 w-3.5" />
              <span>0</span>
            </button>
            <button className="hover:text-sky-500 transition-colors">
              <Share className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
