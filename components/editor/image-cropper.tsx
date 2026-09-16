"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  RotateCw,
  ZoomIn,
  RotateCcw,
  Maximize2,
  Check,
  Undo2,
} from "lucide-react";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { CropSettings, AspectRatioType } from "@/lib/db/types";
import { getCroppedImg } from "@/lib/media/crop-helper";

interface ImageCropperProps {
  imageSrc: string;
  initialCrop?: Partial<CropSettings>;
  platform: string;
  onSaveCrop: (croppedDataUrl: string, settings: CropSettings) => void;
  onCancel?: () => void;
}

const PRESET_RATIOS: Array<{
  id: AspectRatioType;
  label: string;
  aspect: number | undefined;
  iconText: string;
}> = [
  { id: "original", label: "Original", aspect: undefined, iconText: "Auto" },
  { id: "1:1", label: "Square (1:1)", aspect: 1, iconText: "1:1" },
  { id: "4:5", label: "Portrait (4:5)", aspect: 4 / 5, iconText: "4:5" },
  { id: "16:9", label: "Landscape (16:9)", aspect: 16 / 9, iconText: "16:9" },
  { id: "1.91:1", label: "X Landscape (1.91:1)", aspect: 1.91 / 1, iconText: "1.91:1" },
  { id: "2:3", label: "Pinterest (2:3)", aspect: 2 / 3, iconText: "2:3" },
  { id: "1:2", label: "Pinterest Tall (1:2)", aspect: 1 / 2, iconText: "1:2" },
];

export function ImageCropper({
  imageSrc,
  initialCrop,
  platform,
  onSaveCrop,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({
    x: initialCrop?.x || 0,
    y: initialCrop?.y || 0,
  });
  const [zoom, setZoom] = useState<number>(initialCrop?.zoom || 1);
  const [rotation, setRotation] = useState<number>(initialCrop?.rotation || 0);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioType>(
    initialCrop?.aspect || "original"
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPreset = PRESET_RATIOS.find((r) => r.id === selectedRatio);
  const aspect = currentPreset?.aspect;

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setSelectedRatio("original");
  };

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedUrl = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      const settings: CropSettings = {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
        zoom,
        rotation,
        aspect: selectedRatio,
      };

      onSaveCrop(croppedUrl, settings);
    } catch (e) {
      console.error("Failed to crop image:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      {/* Cropper Container */}
      <div className="relative w-full h-[250px] sm:h-[320px] md:h-[360px] bg-zinc-950 rounded-xl overflow-hidden shadow-inner border border-zinc-800">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          showGrid={true}
          cropShape="rect"
        />

        {/* Floating platform label */}
        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white border border-white/10 uppercase tracking-wider">
          {platform} Variant Crop
        </div>
      </div>

      {/* Preset Aspect Ratios */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Aspect Ratio Presets
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {PRESET_RATIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedRatio(preset.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all shrink-0 flex items-center gap-1 ${
                selectedRatio === preset.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background hover:bg-muted text-foreground border-input"
              }`}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls: Zoom & Rotate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/40 rounded-xl border border-border">
        {/* Zoom Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ZoomIn className="h-3.5 w-3.5" />
              Zoom
            </span>
            <span className="text-xs">{zoom.toFixed(1)}x</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([val]) => setZoom(val)}
          />
        </div>

        {/* Rotate Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" />
              Rotation
            </span>
            <span className="text-xs">{rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <Slider
              value={[rotation]}
              min={-180}
              max={180}
              step={1}
              onValueChange={([val]) => setRotation(val)}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Reset All
        </Button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isProcessing}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground font-medium"
          >
            <Check className="h-4 w-4" />
            {isProcessing ? "Cropping..." : "Save Variant Crop"}
          </Button>
        </div>
      </div>
    </div>
  );
}
