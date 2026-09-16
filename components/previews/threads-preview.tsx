import React from "react";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface ThreadsPreviewProps {
  username?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
}

export function ThreadsPreview({
  username = "fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: ThreadsPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-4 font-sans text-sm">
      <div className="flex gap-3">
        {/* Left column with avatar and thread connector line */}
        <div className="flex flex-col items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={displayAvatar} alt={username} />
            <AvatarFallback className="bg-sky-500 text-white">
              <FubberLogo className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="w-[2px] grow bg-zinc-200 dark:bg-zinc-800 my-2 rounded-full min-h-[40px]" />
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="w-4 h-4 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          </div>
        </div>

        {/* Right column with post content */}
        <div className="grow space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                {username}
              </span>
              <span className="text-zinc-400 text-xs">42m</span>
            </div>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Caption */}
          <div className="text-zinc-900 dark:text-zinc-100 text-xs leading-relaxed whitespace-pre-line">
            {caption || <span className="text-zinc-400 italic">No caption written yet...</span>}
          </div>

          {/* Image */}
          {imageUrl ? (
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Threads preview"
                className="w-full max-h-[380px] object-cover"
              />
            </div>
          ) : (
            <div className="h-44 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 text-xs border border-zinc-200 dark:border-zinc-800">
              Upload an image to preview
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-1 text-zinc-700 dark:text-zinc-300">
            <button className="hover:text-rose-500 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              <MessageCircle className="h-4 w-4" />
            </button>
            <button className="hover:text-emerald-500 transition-colors">
              <Repeat2 className="h-4 w-4" />
            </button>
            <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 pt-1">
            <span>0 replies</span> · <span>0 likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
