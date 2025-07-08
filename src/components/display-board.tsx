"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Message, Photo, PhotoGroups, Settings } from "@/lib/data";
import { defaultSettings } from "@/lib/data";
import { getPhotoGroups } from "@/lib/photo-db";
import { getMessages } from "@/lib/message-db";
import { getSettings } from "@/lib/settings-db";
import { cn } from "@/lib/utils";

type DisplayItem = {
  type: "photo" | "message" | "blank";
  duration: number;
  // Photo props
  src?: string;
  alt?: string;
  "data-ai-hint"?: string;
  // Message props
  text?: string;
  fontSize?: number;
};

// Fisher-Yates shuffle algorithm
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const clamp = (n: number, min = 0, max = 1) => Math.min(Math.max(n, min), max);

const scalePoint = (x: number, multiplier: number) =>
  x === 0 || x === 1 ? x : clamp(0.5 + (x - 0.5) * multiplier);

const getZoomEasing = (
  curve: Settings["photoZoomCurve"],
  multiplier: number,
): string => {
  const m = multiplier || 1;
  switch (curve) {
    case "linear":
      return "linear";
    case "cubic":
      return `cubic-bezier(${scalePoint(0.33, m)}, 0, ${scalePoint(0.67, m)}, 1)`;
    case "sigmoid":
      return `cubic-bezier(${scalePoint(0.45, m)}, 0, ${scalePoint(0.55, m)}, 1)`;
    case "quadratic":
      return `cubic-bezier(${scalePoint(0.5, m)}, 0, ${scalePoint(1, m)}, 1)`;
    case "exponential":
      return `cubic-bezier(${scalePoint(0.7, m)}, 0, ${scalePoint(1, m)}, 1)`;
    case "logarithmic":
      return `cubic-bezier(${scalePoint(0, m)}, 0, ${scalePoint(0.3, m)}, 1)`;
    default:
      return "linear";
  }
};

const isNowBetween = (start: number, end: number, hour: number) => {
  if (start <= end) {
    return hour >= start && hour < end;
  }
  return hour >= start || hour < end;
};

const isMessageScheduled = (msg: Message, settings: Settings) => {
  const hour = new Date().getHours();
  switch (msg.schedule) {
    case "Morning":
      return isNowBetween(
        settings.morningStartHour,
        settings.afternoonStartHour,
        hour,
      );
    case "Afternoon":
      return isNowBetween(
        settings.afternoonStartHour,
        settings.eveningStartHour,
        hour,
      );
    case "Evening":
      return isNowBetween(
        settings.eveningStartHour,
        settings.nightStartHour,
        hour,
      );
    case "Night":
      return isNowBetween(
        settings.nightStartHour,
        settings.morningStartHour,
        hour,
      );
    default:
      return true;
  }
};

export function DisplayBoard({
  onStatusChange,
  onBlankScreenChange,
}: {
  onStatusChange: (message: string) => void;
  onBlankScreenChange: (isBlank: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<DisplayItem | null>(null);
  const [displayQueue, setDisplayQueue] = useState<DisplayItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // To reset animations
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Effect to load data and build the queue once
  useEffect(() => {
    const buildQueue = async () => {
      setIsLoading(true);
      onStatusChange("Initializing: Loading content from database...");
      try {
        const [loadedSettings, messages, photoGroups] = await Promise.all([
          getSettings(),
          getMessages(),
          getPhotoGroups(),
        ]);

        setSettings(loadedSettings);
        document.documentElement.classList.toggle(
          "dark",
          loadedSettings.theme === "dark",
        );

        const monitor = loadedSettings.monitorActivity;
        if (monitor) {
          onStatusChange("Initializing: Building display queue...");
        }

        let contentItems: DisplayItem[] = [];

        // 1. Add photos if enabled
        if (
          loadedSettings.displayPhotos &&
          Object.keys(photoGroups).length > 0
        ) {
          let photoList: Photo[] = Object.values(photoGroups)
            .flat()
            .filter((p) => p && p.src);
          if (loadedSettings.randomizeAllPhotos) {
            photoList = shuffle(photoList);
          } else {
            const groupedList: Photo[] = [];
            const categories = Object.keys(photoGroups).sort();
            for (const category of categories) {
              let groupPhotos = photoGroups[category] || [];
              if (loadedSettings.randomizeInPhotoGroups) {
                groupPhotos = shuffle(groupPhotos);
              }
              groupedList.push(...groupPhotos);
            }
            photoList = groupedList;
          }
          const photoItems: DisplayItem[] = photoList
            .filter((p) => p && p.src)
            .map((p) => ({
              type: "photo",
              src: p.src,
              alt: p.alt,
              "data-ai-hint": p["data-ai-hint"],
              duration: (loadedSettings.photoDuration || 10) * 1000,
            }));
          contentItems.push(...photoItems);
        }

        // 2. Add messages if enabled
        if (loadedSettings.displayMessages) {
          const activeMessages = messages.filter(
            (m) =>
              m.status === "Active" && isMessageScheduled(m, loadedSettings),
          );
          const getMessageDuration = (text: string) => {
            const baseDuration = (text.split(/\s+/).length * 0.5 + 5) * 1000;
            const scrollFactor = (150 - loadedSettings.scrollSpeed) / 50;
            const animationDistanceFactor = 2;
            return baseDuration * scrollFactor * animationDistanceFactor;
          };
          const messageItems: DisplayItem[] = activeMessages.map((m) => ({
            type: "message",
            text: m.content,
            duration: getMessageDuration(m.content),
            fontSize: loadedSettings.messageFontSize,
          }));
          contentItems.push(...messageItems);
        }

        // 3. Shuffle globally if enabled
        if (loadedSettings.randomize) {
          contentItems = shuffle(contentItems);
        }

        // 4. Build final queue with blank screens
        const finalQueue: DisplayItem[] = [];
        if (contentItems.length > 0) {
          contentItems.forEach((item, index) => {
            finalQueue.push(item);
            if (
              loadedSettings.useBlankScreens &&
              loadedSettings.blankDuration > 0 &&
              index < contentItems.length - 1
            ) {
              finalQueue.push({
                type: "blank",
                duration: (loadedSettings.blankDuration || 3) * 1000,
              });
            }
          });
        }

        if (monitor) {
          if (finalQueue.length > 0) {
            onStatusChange(
              `Initialization complete. ${finalQueue.length} items in queue.`,
            );
          } else {
            onStatusChange("Initialization complete. No content to display.");
          }
        } else if (finalQueue.length === 0) {
          onStatusChange(
            "No content to display. Enable content in the admin panel.",
          );
        }

        setDisplayQueue(finalQueue);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        onStatusChange(`Error: Failed to load data. ${message}`);
        console.error("Failed to load data from storage", error);
      } finally {
        setIsLoading(false);
      }
    };
    buildQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to manage the display timer loop
  useEffect(() => {
    if (isLoading || displayQueue.length === 0) {
      return;
    }

    const item = displayQueue[currentIndex];
    setCurrentItem(item);
    setKey((k) => k + 1); // Force re-render for animations

    onBlankScreenChange(item.type === "blank");

    if (settings.monitorActivity) {
      switch (item.type) {
        case "photo":
          onStatusChange(
            `Displaying photo: "${item.alt}" for ${item.duration / 1000}s.`,
          );
          break;
        case "message":
          onStatusChange(
            `Scrolling message: "${item.text?.substring(0, 40)}..."`,
          );
          break;
        case "blank":
          onStatusChange(
            `Displaying blank screen for ${item.duration / 1000}s.`,
          );
          break;
        default:
          onStatusChange("Error: Unknown item type in queue.");
          break;
      }
    }

    const duration = item?.duration > 0 ? item.duration : 5000;

    const timer = setTimeout(() => {
      if (settings.monitorActivity) {
        onStatusChange("Waiting for next item...");
      }
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => {
      clearTimeout(timer);
      onBlankScreenChange(false);
    };
  }, [
    currentIndex,
    displayQueue,
    isLoading,
    onStatusChange,
    settings,
    onBlankScreenChange,
  ]);

  const renderItem = () => {
    if (isLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-2xl text-muted-foreground">
            Initializing MemBoard...
          </p>
        </div>
      );
    }
    if (!currentItem) {
      return (
        <div className="flex h-full w-full items-center justify-center text-center p-8">
          <p className="text-2xl text-muted-foreground">
            No content to display. Visit the admin panel to add photos or
            messages.
          </p>
        </div>
      );
    }

    switch (currentItem.type) {
      case "photo":
        let style: React.CSSProperties = {};
        let imgProps: Record<string, any> = {
          src: currentItem.src!,
          alt: currentItem.alt || "",
          "data-ai-hint": currentItem["data-ai-hint"],
        };
        switch (settings.photoDisplayMode) {
          case "maxWidthCrop":
            style = { width: "100%", height: "auto", objectFit: "cover" };
            break;
          case "maxHeightCrop":
            style = { width: "auto", height: "100%", objectFit: "cover" };
            break;
          case "noCrop":
          default:
            style = { width: "100%", height: "100%", objectFit: "contain" };
            break;
        }
        if (settings.photoZoomPercent > 0) {
          let zoomScale: number | undefined;
          let zoomDuration: number;
          if (
            settings.photoDisplayMode === "maxWidthCrop" ||
            settings.photoDisplayMode === "maxHeightCrop"
          ) {
            if (containerRef.current && naturalSize) {
              const cw = containerRef.current.clientWidth;
              const ch = containerRef.current.clientHeight;
              const iw = naturalSize.width;
              const ih = naturalSize.height;
              const containerAR = cw / ch;
              const imageAR = iw / ih;
              zoomScale = Math.min(
                1,
                settings.photoDisplayMode === "maxWidthCrop"
                  ? imageAR / containerAR
                  : containerAR / imageAR,
              );
            } else {
              zoomScale = 1;
            }
            zoomDuration = Math.max(currentItem.duration / 1000 - 1, 0);
          } else {
            zoomScale = 1 + settings.photoZoomPercent / 100;
            zoomDuration =
              settings.photoZoomDuration > 0
                ? settings.photoZoomDuration
                : currentItem.duration / 1000;
          }
          style = {
            ...style,
            "--zoom-scale": zoomScale,
            "--zoom-duration": `${zoomDuration}s`,
            "--zoom-easing": getZoomEasing(
              settings.photoZoomCurve,
              settings.photoZoomCurveMultiplier,
            ),
          } as React.CSSProperties;
        }
        return (
          <div
            key={key}
            ref={containerRef}
            className="relative flex h-full w-full items-center justify-center overflow-hidden animate-fade-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              {...imgProps}
              onLoad={(e) =>
                setNaturalSize({
                  width: e.currentTarget.naturalWidth,
                  height: e.currentTarget.naturalHeight,
                })
              }
              style={style}
              className={cn(
                settings.photoZoomPercent > 0 ? "animate-zoom-in" : "",
              )}
            />
          </div>
        );
      case "message":
        const messageStyle = {
          "--scroll-duration": `${currentItem.duration / 1000}s`,
          fontSize: `${currentItem.fontSize}px`,
        } as React.CSSProperties;

        return (
          <div
            key={key}
            className="flex h-full w-full items-center justify-center p-12 bg-background animate-fade-in"
          >
            <div className="relative h-full w-full overflow-hidden">
              <div
                className="animate-scroll-message absolute flex h-full w-full flex-col justify-center text-center"
                style={messageStyle}
              >
                <p className="font-body leading-normal text-foreground">
                  {currentItem.text}
                </p>
              </div>
            </div>
          </div>
        );
      case "blank":
      default:
        // This just needs to be a placeholder, the parent component handles the fade to black.
        return <div key={key} className="h-full w-full bg-background" />;
    }
  };

  return (
    <Card className="h-full w-full rounded-none border-none bg-background shadow-none">
      <CardContent className="h-full w-full p-0">{renderItem()}</CardContent>
    </Card>
  );
}
