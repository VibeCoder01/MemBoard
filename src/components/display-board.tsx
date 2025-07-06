"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Message, Photo, PhotoGroups, Settings } from '@/lib/data';
import { defaultSettings, initialMessages, initialPhotoGroups } from '@/lib/data';

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

export function DisplayBoard({ onStatusChange }: { onStatusChange: (message: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<DisplayItem | null>(null);
  const [displayQueue, setDisplayQueue] = useState<DisplayItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // To reset animations

  // Effect to load data and build the queue once
  useEffect(() => {
    let loadedSettings: Settings;
    let monitorActivity = defaultSettings.monitorActivity;

    if (monitorActivity) {
      onStatusChange('Initializing: Loading settings...');
    } else {
      onStatusChange('All systems normal.');
    }
    
    try {
      const savedSettings = localStorage.getItem('displaySettings');
      loadedSettings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
      monitorActivity = loadedSettings.monitorActivity;
      setSettings(loadedSettings);

      if (monitorActivity) onStatusChange('Initializing: Loading content...');
      
      const savedMessages = localStorage.getItem('messages');
      const messages: Message[] = savedMessages ? JSON.parse(savedMessages) : initialMessages;
      
      const savedPhotos = localStorage.getItem('photoGroups');
      const parsedPhotos = savedPhotos ? JSON.parse(savedPhotos) : initialPhotoGroups;
      const photoGroups: PhotoGroups = (parsedPhotos && Object.keys(parsedPhotos).length > 0) ? parsedPhotos : initialPhotoGroups;

      if (monitorActivity) onStatusChange('Initializing: Building display queue...');
      
      // 2. Assemble content based on settings
      let contentItems: DisplayItem[] = [];

      // Add photos ONLY if enabled
      if (loadedSettings.displayPhotos) {
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
            .filter(p => p && p.src)
            .map(p => ({
              type: 'photo',
              src: p.src,
              alt: p.alt,
              'data-ai-hint': p['data-ai-hint'],
              duration: (loadedSettings.photoDuration || 10) * 1000
            }));
          contentItems.push(...photoItems);
      }
      
      // Add messages ONLY if enabled
      if (loadedSettings.displayMessages) {
          const activeMessages = messages.filter(m => m.status === 'Active');
          
          const getMessageDuration = (text: string) => {
            const baseDuration = (text.split(/\s+/).length * 0.5 + 5) * 1000;
            const scrollFactor = (150 - loadedSettings.scrollSpeed) / 50; 
            const animationDistanceFactor = 2; // to ensure it scrolls fully off
            return baseDuration * scrollFactor * animationDistanceFactor;
          };

          const messageItems: DisplayItem[] = activeMessages.map(m => {
              const duration = getMessageDuration(m.content);
              return {
                  type: 'message',
                  text: m.content,
                  duration: duration,
                  fontSize: loadedSettings.messageFontSize,
              };
          });
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
          // Add a blank screen if enabled, but not after the very last item
          if (loadedSettings.useBlankScreens && loadedSettings.blankDuration > 0 && index < contentItems.length - 1) {
              finalQueue.push({ type: 'blank', duration: (loadedSettings.blankDuration || 3) * 1000 });
          }
        });
      }
      
      if (monitorActivity) {
        if (finalQueue.length > 0) {
          onStatusChange(`Initialization complete. ${finalQueue.length} items in queue.`);
        } else {
          onStatusChange('Initialization complete. No content to display.');
        }
      }
      
      setDisplayQueue(finalQueue);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      if (monitorActivity) {
          onStatusChange(`Error: Failed to load data. ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsLoading(false);
  }, [onStatusChange]);

  // Effect to manage the display timer loop
  useEffect(() => {
    const monitorActivity = settings.monitorActivity;

    if (isLoading) {
      return;
    }

    if (displayQueue.length === 0) {
      if (monitorActivity) onStatusChange('No content to display.');
      setCurrentItem(null);
      return;
    }
    
    const item = displayQueue[currentIndex];
    setCurrentItem(item);
    setKey(k => k + 1);
    
    if (monitorActivity) {
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
    } else {
      onStatusChange('All systems normal.');
    }
    
    const duration = item?.duration > 0 ? item.duration : 5000;

    const timer = setTimeout(() => {
      if (monitorActivity) onStatusChange('Waiting for next item...');
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, displayQueue, isLoading, onStatusChange, settings]);

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
        const scrollDuration = currentItem.duration / 1000;
        const style = {
          '--scroll-duration': `${scrollDuration}s`,
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
        return <div key={key} className="h-full w-full bg-background animate-fade-in" />;
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
