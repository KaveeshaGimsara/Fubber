"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  X,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { formatBytes } from "@/lib/utils";

interface MasterContentProps {
  mainCaption: string;
  onCaptionChange: (caption: string) => void;
  mainImageUrl: string | null;
  imageMetadata: {
    filename?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    format?: string;
  } | null;
  onImageSelected: (
    file: File,
    dataUrl: string,
    metadata: {
      filename: string;
      width: number;
      height: number;
      fileSize: number;
      format: string;
    }
  ) => void;
  onRemoveImage: () => void;
}

export function MasterContentStep({
  mainCaption,
  onCaptionChange,
  mainImageUrl,
  imageMetadata,
  onImageSelected,
  onRemoveImage,
}: MasterContentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Supported image formats: JPEG, PNG, or WebP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("File size exceeds 15MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected(file, dataUrl, {
          filename: file.name,
          width: img.width,
          height: img.height,
          fileSize: file.size,
          format: file.type.split("/")[1] || "jpeg",
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Step 1: Master Content
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Provide the original image and baseline caption. Variants inherit this content automatically.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Dropzone / Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">
              Master Image
            </label>
            {imageMetadata && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {imageMetadata.width} × {imageMetadata.height} px
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {!mainImageUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-[220px] sm:h-[240px] rounded-xl border border-dashed transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-muted/20"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <UploadCloud className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Drop image here or click to browse
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                JPEG, PNG, or WebP up to 15MB
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-border overflow-hidden bg-zinc-950 group h-[220px] sm:h-[240px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImageUrl}
                alt="Master preview"
                className="max-h-full w-full object-contain"
              />

              {/* Top Quick Actions (Always visible on mobile/tablet, subtle on desktop) */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 px-2.5 text-[11px] gap-1 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-sm"
                  title="Replace Image"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span className="hidden sm:inline">Replace</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onRemoveImage}
                  className="h-7 px-2 text-[11px] gap-1 shadow-sm"
                  title="Remove Image"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Remove</span>
                </Button>
              </div>

              {/* Hover overlay for desktop cursor */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2 pointer-events-none">
                <span className="text-xs font-medium text-white/90 bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                  Image Ready
                </span>
              </div>

              {imageMetadata && (
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-white flex items-center justify-between text-[9px] sm:text-[10px]">
                  <span className="truncate max-w-[120px] sm:max-w-[180px] font-mono">{imageMetadata.filename}</span>
                  <div className="flex items-center gap-2 shrink-0 text-zinc-300 font-mono">
                    <span>{imageMetadata.width}×{imageMetadata.height}</span>
                    <span>•</span>
                    <span>{formatBytes(imageMetadata.fileSize || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Master Caption */}
        <div className="space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-foreground">
                Master Caption
              </label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {mainCaption.length} chars
              </span>
            </div>

            <Textarea
              value={mainCaption}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Enter master caption text..."
              className="h-[205px] text-xs leading-relaxed rounded-xl resize-none font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
