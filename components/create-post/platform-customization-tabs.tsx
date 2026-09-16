"use client";

import React, { useState } from "react";
import {
  Copy,
  RotateCcw,
  Trash2,
  Crop,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/tabs";
import { Switch } from "@/ui/switch";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { PostVariant, PlatformType, CropSettings, SocialAccount } from "@/lib/db/types";
import { getPublisher } from "@/lib/social/registry";
import { ImageCropper } from "@/components/editor/image-cropper";
import { FacebookPreview } from "@/components/previews/facebook-preview";
import { InstagramPreview } from "@/components/previews/instagram-preview";
import { ThreadsPreview } from "@/components/previews/threads-preview";
import { XPreview } from "@/components/previews/x-preview";
import { PinterestPreview } from "@/components/previews/pinterest-preview";
import { YouTubeCommunityPreview } from "@/components/previews/youtube-preview";
import { LinkedInPreview } from "@/components/previews/linkedin-preview";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  XIcon,
  PinterestIcon,
  YouTubeIcon,
  LinkedInIcon,
} from "@/components/icons/social-icons";

interface PlatformCustomizationProps {
  variants: PostVariant[];
  masterCaption: string;
  masterImageUrl: string | null;
  accounts?: SocialAccount[];
  onUpdateVariant: (platform: PlatformType, updates: Partial<PostVariant>) => void;
}

const PLATFORMS: Array<{
  id: PlatformType;
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "facebook", name: "Facebook", Icon: FacebookIcon },
  { id: "instagram", name: "Instagram", Icon: InstagramIcon },
  { id: "threads", name: "Threads", Icon: ThreadsIcon },
  { id: "x", name: "X", Icon: XIcon },
  { id: "linkedin", name: "LinkedIn", Icon: LinkedInIcon },
  { id: "pinterest", name: "Pinterest", Icon: PinterestIcon },
  { id: "youtube", name: "YouTube", Icon: YouTubeIcon },
];

export function PlatformCustomizationTabs({
  variants,
  masterCaption,
  masterImageUrl,
  accounts = [],
  onUpdateVariant,
}: PlatformCustomizationProps) {
  const [activePlatform, setActivePlatform] = useState<PlatformType>("facebook");
  const [editingImageForPlatform, setEditingImageForPlatform] = useState<PlatformType | null>(null);

  const connectedAccount = accounts.find(
    (a) => a.platform === activePlatform && a.isConnected
  );

  const currentVariant = variants.find((v) => v.platform === activePlatform) || {
    id: `var_${activePlatform}`,
    postId: "",
    platform: activePlatform,
    caption: masterCaption,
    mediaUrl: masterImageUrl,
    mediaAssetId: null,
    cropSettings: null,
    aspectRatio: "original",
    isEnabled: true,
    publishStatus: "idle",
    publishedAt: null,
    externalPostId: null,
    errorMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const publisher = getPublisher(activePlatform);
  const validation = publisher.validatePost(
    currentVariant.caption,
    currentVariant.mediaUrl
  );

  const charCount = currentVariant.caption.length;
  const isOverLimit = charCount > publisher.maxCharacters;

  const handleCopyMaster = () => {
    onUpdateVariant(activePlatform, { caption: masterCaption });
  };

  const handleResetCaption = () => {
    onUpdateVariant(activePlatform, { caption: masterCaption });
  };

  const handleClearCaption = () => {
    onUpdateVariant(activePlatform, { caption: "" });
  };

  const handleSaveCrop = (croppedUrl: string, settings: CropSettings) => {
    if (editingImageForPlatform) {
      onUpdateVariant(editingImageForPlatform, {
        mediaUrl: croppedUrl,
        cropSettings: settings,
        aspectRatio: settings.aspect,
      });
      setEditingImageForPlatform(null);
    }
  };

  const handleResetImageToMaster = () => {
    onUpdateVariant(activePlatform, {
      mediaUrl: masterImageUrl,
      cropSettings: null,
      aspectRatio: "original",
    });
  };

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">
          Step 2: Platform Customization & Previews
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Edit captions and crop images independently for each network. Modifying one platform does not alter others.
        </p>
      </div>

      <Tabs
        value={activePlatform}
        onValueChange={(val) => setActivePlatform(val as PlatformType)}
        className="w-full space-y-4"
      >
        {/* Platform Selector Bar with Smooth Horizontal Scrolling */}
        <div className="overflow-x-auto pb-1.5 scrollbar-thin">
          <TabsList className="inline-flex min-w-full sm:min-w-max justify-start h-10 bg-muted/50 p-1 rounded-xl gap-1">
            {PLATFORMS.map(({ id, name, Icon }) => {
              const v = variants.find((item) => item.platform === id);
              const enabled = v ? v.isEnabled : true;
              return (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-none transition-all"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{name}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Content for current platform */}
        <TabsContent value={activePlatform} className="space-y-4 m-0">
          {/* Header toggle */}
          <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-foreground">
                {publisher.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                ({charCount} / {publisher.maxCharacters.toLocaleString()} chars)
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs text-muted-foreground">
                {currentVariant.isEnabled ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={currentVariant.isEnabled}
                onCheckedChange={(enabled) =>
                  onUpdateVariant(activePlatform, { isEnabled: enabled })
                }
              />
            </div>
          </div>

          {/* Editor and Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Controls (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Image Variant Controls */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Image Variant
                  </span>
                  <div className="flex items-center gap-2">
                    {currentVariant.mediaUrl !== masterImageUrl && (
                      <button
                        onClick={handleResetImageToMaster}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline"
                      >
                        Reset to Original
                      </button>
                    )}
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {currentVariant.aspectRatio || "Original"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-border flex items-center justify-center">
                    {currentVariant.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentVariant.mediaUrl}
                        alt="Platform variant"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-500">No Image</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground">
                      Crop or change aspect ratio specifically for {publisher.displayName}.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingImageForPlatform(activePlatform)}
                      disabled={!masterImageUrl}
                      className="h-7 px-2.5 text-xs gap-1.5 rounded-lg"
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                      <span>Edit Crop</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Caption Editor */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">
                    Caption
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyMaster}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Master
                    </button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <button
                      onClick={handleResetCaption}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <button
                      onClick={handleClearCaption}
                      className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                </div>

                <Textarea
                  value={currentVariant.caption}
                  onChange={(e) =>
                    onUpdateVariant(activePlatform, { caption: e.target.value })
                  }
                  placeholder={`Write caption for ${publisher.displayName}...`}
                  className="min-h-[140px] text-xs leading-relaxed rounded-xl resize-none"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    {isOverLimit ? (
                      <span className="text-destructive text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Limit exceeded by {charCount - publisher.maxCharacters} chars
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">
                        {publisher.maxCharacters - charCount} chars remaining
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {charCount} / {publisher.maxCharacters.toLocaleString()}
                  </span>
                </div>

                {validation.issues.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {validation.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs flex items-start gap-2 ${
                          issue.severity === "error"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview (6 cols) */}
            <div className="lg:col-span-6 space-y-2">
              <span className="text-xs font-medium text-muted-foreground block">
                Live Preview
              </span>

              <div className="p-4 rounded-2xl bg-muted/20 border border-border flex items-center justify-center min-h-[440px] overflow-hidden">
                {activePlatform === "facebook" && (
                  <FacebookPreview
                    pageName={connectedAccount?.accountName || "Fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "instagram" && (
                  <InstagramPreview
                    username={connectedAccount?.accountUsername || "fubber.official"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "threads" && (
                  <ThreadsPreview
                    username={connectedAccount?.accountUsername || "fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "x" && (
                  <XPreview
                    displayName={connectedAccount?.accountName || "Fubber"}
                    handle={connectedAccount?.accountUsername || "fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "linkedin" && (
                  <LinkedInPreview
                    authorName={connectedAccount?.accountName || "Fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "pinterest" && (
                  <PinterestPreview
                    authorName={connectedAccount?.accountName || "Fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
                {activePlatform === "youtube" && (
                  <YouTubeCommunityPreview
                    channelName={connectedAccount?.accountName || "Fubber"}
                    avatarUrl={connectedAccount?.profileImageUrl || undefined}
                    caption={currentVariant.caption}
                    imageUrl={currentVariant.mediaUrl}
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Cropper Modal */}
      <Dialog
        open={Boolean(editingImageForPlatform)}
        onOpenChange={(open) => !open && setEditingImageForPlatform(null)}
      >
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Crop Image for {editingImageForPlatform ? getPublisher(editingImageForPlatform).displayName : ""}
            </DialogTitle>
          </DialogHeader>

          {editingImageForPlatform && masterImageUrl && (
            <ImageCropper
              imageSrc={masterImageUrl}
              platform={editingImageForPlatform}
              initialCrop={currentVariant.cropSettings || undefined}
              onSaveCrop={handleSaveCrop}
              onCancel={() => setEditingImageForPlatform(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
