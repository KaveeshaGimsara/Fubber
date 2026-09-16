import React from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface InstagramPreviewProps {
  username?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
  aspectRatio?: string;
}

export function InstagramPreview({
  username = "fubber.official",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: InstagramPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;

  return (
    <div className="w-full max-w-[450px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden font-sans text-sm">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600">
            <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-zinc-900">
              <AvatarImage src={displayAvatar} alt={username} />
              <AvatarFallback className="bg-sky-500 text-white">
                <FubberLogo className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              {username}
              <span className="text-blue-500 text-[10px]">●</span>
            </div>
            <div className="text-[11px] text-zinc-400">Original audio</div>
          </div>
        </div>
        <button className="text-zinc-600 dark:text-zinc-400">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Image (Square 1:1, Portrait 4:5, Landscape 1.91:1) */}
      {imageUrl ? (
        <div className="relative w-full bg-black flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Instagram preview"
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-zinc-400 text-xs">
          Upload an image to preview
        </div>
      )}

      {/* Action Icons */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-zinc-800 dark:text-zinc-200">
            <button className="hover:text-rose-600 transition-colors">
              <Heart className="h-6 w-6 stroke-[1.75]" />
            </button>
            <button className="hover:text-zinc-500 transition-colors">
              <MessageCircle className="h-6 w-6 stroke-[1.75]" />
            </button>
            <button className="hover:text-zinc-500 transition-colors">
              <Send className="h-6 w-6 stroke-[1.75]" />
            </button>
          </div>
          <button className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 transition-colors">
            <Bookmark className="h-6 w-6 stroke-[1.75]" />
          </button>
        </div>

        {/* Likes */}
        <div className="mt-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          0 likes
        </div>

        {/* Caption */}
        <div className="mt-1 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-2">
            {username}
          </span>
          <span className="whitespace-pre-line">
            {caption || <span className="text-zinc-400 italic">No caption written yet</span>}
          </span>
        </div>

        <div className="mt-2 text-[11px] text-zinc-400">0 comments</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">
          Just now
        </div>
      </div>
    </div>
  );
}
