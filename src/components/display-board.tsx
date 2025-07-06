
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Message, Photo, PhotoGroups, Settings } from '@/lib/data';
import { defaultSettings, initialMessages } from '@/lib/data';
import { getPhotoGroups } from '@/lib/photo-db';


type DisplayItem = {
  type: 'photo' | 'message' | 'blank';
  duration: number;
  // Photo props
  src?: string;
  alt?: string;
  'data-ai-hint'?: string;
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

  // Effect to load data and build the queue once
  useEffect(() => {
    const buildQueue = async () => {
        try {
          const savedSettings = localStorage.getItem('displaySettings');
          const loadedSettings = savedSettings 
            ? { ...defaultSettings, ...JSON.parse(savedSettings) } 
            : defaultSettings;
          setSettings(loadedSettings);

          const monitor = loadedSettings.monitorActivity;
          if (monitor) {
            onStatusChange('Initializing: Loading content...');
          }

          const savedMessages = localStorage.getItem('messages');
          const messages: Message[] = savedMessages ? JSON.parse(savedMessages) : initialMessages;
          
          const photoGroups: PhotoGroups = await getPhotoGroups();
          
          let contentItems: DisplayItem[] = [];

          // 1. Add photos if enabled
          if (loadedSettings.displayPhotos && Object.keys(photoGroups).length > 0) {
              let photoList: Photo[] = Object.values(photoGroups).flat().filter(p => p && p.src);
              if (loadedSettings.randomizeAllPhotos) {
                  photoList = shuffle(photoList);
              } else {
                  const groupedList: Photo[] = [];
                  const categories = Object.keys(photoGroups);
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
                .filter(p => p && p.src) // extra safety check
                .map(p => ({
                  type: 'photo',
                  src: p.src,
                  alt: p.alt,
                  'data-ai-hint': p['data-ai-hint'],
                  duration: (loadedSettings.photoDuration || 10) * 1000
                }));
              contentItems.push(...photoItems);
          }
          
          // 2. Add messages if enabled
          if (loadedSettings.displayMessages) {
              const activeMessages = messages.filter(m => m.status === 'Active');
              const getMessageDuration = (text: string) => {
                const baseDuration = (text.split(/\s+/).length * 0.5 + 5) * 1000;
                const scrollFactor = (150 - loadedSettings.scrollSpeed) / 50; 
                const animationDistanceFactor = 2; // This ensures it scrolls off screen
                return baseDuration * scrollFactor * animationDistanceFactor;
              };
              const messageItems: DisplayItem[] = activeMessages.map(m => ({
                  type: 'message',
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
              if (loadedSettings.useBlankScreens && loadedSettings.blankDuration > 0 && index < contentItems.length - 1) {
                  finalQueue.push({ type: 'blank', duration: (loadedSettings.blankDuration || 3) * 1000 });
              }
            });
          }
          
          if (monitor) {
            if (finalQueue.length > 0) {
              onStatusChange(`Initialization complete. ${finalQueue.length} items in queue.`);
            } else {
              onStatusChange('Initialization complete. No content to display.');
            }
          } else if (finalQueue.length === 0) {
              onStatusChange('No content to display. Enable content in the admin panel.');
          }
          
          setDisplayQueue(finalQueue);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            onStatusChange(`Error: Failed to load data. ${message}`);
            console.error("Failed to load data from storage", error);
        } finally {
            setIsLoading(false);
        }
    }
    buildQueue();
  }, [onStatusChange]);

  // Effect to manage the display timer loop
  useEffect(() => {
    if (isLoading || displayQueue.length === 0) {
        return;
    }
    
    const item = displayQueue[currentIndex];
    setCurrentItem(item);
    setKey(k => k + 1); // Force re-render for animations
    
    onBlankScreenChange(item.type === 'blank');
    
    if (settings.monitorActivity) {
      switch (item.type) {
        case 'photo':
          onStatusChange(`Displaying photo: "${item.alt}" for ${item.duration / 1000}s.`);
          break;
        case 'message':
          onStatusChange(`Scrolling message: "${item.text?.substring(0, 40)}..."`);
          break;
        case 'blank':
          onStatusChange(`Displaying blank screen for ${item.duration / 1000}s.`);
          break;
        default:
          onStatusChange('Error: Unknown item type in queue.');
          break;
      }
    }
    
    const duration = item?.duration > 0 ? item.duration : 5000;

    const timer = setTimeout(() => {
      if (settings.monitorActivity) {
          onStatusChange('Waiting for next item...');
      }
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => {
      clearTimeout(timer);
      onBlankScreenChange(false);
    };
  }, [currentIndex, displayQueue, isLoading, onStatusChange, settings, onBlankScreenChange]);

  const renderItem = () => {
    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><p className="text-2xl text-muted-foreground">Initializing MemBoard...</p></div>;
    }
    if (!currentItem) {
        return <div className="flex h-full w-full items-center justify-center text-center p-8"><p className="text-2xl text-muted-foreground">No content to display. Enable photos or messages in the admin panel.</p></div>;
    }

    switch (currentItem.type) {
      case 'photo':
        return (
          <div key={key} className="relative h-full w-full animate-fade-in">
            <Image
              src={currentItem.src!}
              alt={currentItem.alt || ''}
              fill={true}
              style={{ objectFit: 'cover' }}
              data-ai-hint={currentItem['data-ai-hint']}
              priority={true}
            />
          </div>
        );
      case 'message':
        const style = {
          '--scroll-duration': `${currentItem.duration / 1000}s`,
           fontSize: `${currentItem.fontSize}px`
        } as React.CSSProperties;

        return (
          <div key={key} className="flex h-full w-full items-center justify-center p-12 bg-background animate-fade-in">
            <div className="relative h-full w-full overflow-hidden">
               <div
                className="animate-scroll-message absolute flex h-full w-full flex-col justify-center text-center"
                style={style}
              >
                <p className="font-body leading-normal text-foreground">
                  {currentItem.text}
                </p>
              </div>
            </div>
          </div>
        );
      case 'blank':
      default:
        // This just needs to be a placeholder, the parent component handles the fade to black.
        return <div key={key} className="h-full w-full bg-background" />;
    }
  };

  return (
    <Card className="h-full w-full rounded-none border-none bg-background shadow-none">
      <CardContent className="h-full w-full p-0">
        {renderItem()}
      </CardContent>
    </Card>
  );
}
