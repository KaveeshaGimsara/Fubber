import React from "react";
import { Upload, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

import { FubberLogo, FUBBER_AVATAR_DATA_URI } from "@/components/icons/fubber-logo";

interface PinterestPreviewProps {
  boardName?: string;
  authorName?: string;
  avatarUrl?: string;
  caption: string;
  imageUrl?: string | null;
}

export function PinterestPreview({
  boardName = "Design Inspiration",
  authorName = "Fubber",
  avatarUrl = FUBBER_AVATAR_DATA_URI,
  caption,
  imageUrl,
}: PinterestPreviewProps) {
  const displayAvatar = avatarUrl || FUBBER_AVATAR_DATA_URI;
  return (
    <div className="w-full max-w-[340px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm font-sans text-sm">
      {/* Pin Card */}
      <div className="relative group bg-zinc-100 dark:bg-zinc-950">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Pinterest Pin"
            className="w-full max-h-[500px] object-cover"
          />
        ) : (
          <div className="aspect-[2/3] flex flex-col items-center justify-center text-zinc-400 text-xs p-4 text-center">
            Upload an image to preview (2:3 portrait recommended)
          </div>
        )}

        {/* Floating Pin Header overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium">
            {boardName}
          </span>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-full text-xs shadow-md pointer-events-auto transition-colors">
            Save
          </button>
        </div>

        {/* Bottom hover actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto">
          <button className="w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <Upload className="h-4 w-4" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description & Author info */}
      <div className="p-3.5 space-y-2">
        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs leading-snug line-clamp-2">
          {caption || <span className="text-zinc-400 italic">No pin description...</span>}
        </h4>
        <div className="flex items-center gap-2 pt-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={displayAvatar} alt={authorName} />
            <AvatarFallback className="bg-sky-500 text-white">
              <FubberLogo className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            {authorName}
          </span>
        </div>
      </div>
    </div>
  );
}
