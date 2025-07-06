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
  scrollDuration?: number;
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

export function DisplayBoard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayQueue, setDisplayQueue] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // To reset animations

  // Effect to load data and build the queue once on mount
  useEffect(() => {
    // 1. Load data with fallbacks
    let settings: Settings;
    let messages: Message[];
    let photoGroups: PhotoGroups;

    try {
      const savedSettings = localStorage.getItem('displaySettings');
      settings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
      
      const savedMessages = localStorage.getItem('messages');
      messages = savedMessages ? JSON.parse(savedMessages) : initialMessages;
      
      const savedPhotos = localStorage.getItem('photoGroups');
      photoGroups = (savedPhotos && Object.keys(JSON.parse(savedPhotos)).length > 0) ? JSON.parse(savedPhotos) : initialPhotoGroups;
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      settings = defaultSettings;
      messages = initialMessages;
      photoGroups = initialPhotoGroups;
    }
    
    // 2. Assemble content based on settings
    let contentItems: DisplayItem[] = [];

    // Add photos ONLY if enabled
    if (settings.displayPhotos) {
        let photoList: Photo[] = Object.values(photoGroups).flat();

        if (settings.randomizeAllPhotos) {
            photoList = shuffle(photoList);
        } else {
            const groupedList: Photo[] = [];
            const categories = Object.keys(photoGroups);
            for (const category of categories) {
                let groupPhotos = photoGroups[category] || [];
                if (settings.randomizeInPhotoGroups) {
                    groupPhotos = shuffle(groupPhotos);
                }
                groupedList.push(...groupPhotos);
            }
            photoList = groupedList;
        }
        
        // Create display items, filtering for valid photos
        const photoItems: DisplayItem[] = photoList
          .filter(p => p && p.src)
          .map(p => ({
            type: 'photo',
            src: p.src,
            alt: p.alt,
            'data-ai-hint': p['data-ai-hint'],
            duration: (settings.photoDuration || 10) * 1000
          }));
        contentItems.push(...photoItems);
    }
    
    // Add messages ONLY if enabled
    if (settings.displayMessages) {
        const activeMessages = messages.filter(m => m.status === 'Active');
        const scrollDuration = 60 - (settings.scrollSpeed / 100) * 50; 
        const messageItems: DisplayItem[] = activeMessages.map(m => ({
          type: 'message',
          text: m.content,
          duration: (settings.messageDuration || 15) * 1000,
          fontSize: settings.messageFontSize,
          scrollDuration: scrollDuration,
        }));
        contentItems.push(...messageItems);
    }
    
    // 3. Shuffle globally if enabled
    if (settings.randomize) {
      contentItems = shuffle(contentItems);
    }
    
    // 4. Build final queue with blank screens
    const finalQueue: DisplayItem[] = [];
    if (contentItems.length > 0) {
      contentItems.forEach((item, index) => {
        finalQueue.push(item);
        // Add a blank screen if enabled, but not after the very last item
        if (settings.useBlankScreens && settings.blankDuration > 0 && index < contentItems.length - 1) {
            finalQueue.push({ type: 'blank', duration: (settings.blankDuration || 3) * 1000 });
        }
      });
    }
    
    // 5. Set state
    setDisplayQueue(finalQueue);
    setIsLoading(false);
  }, []);

  // Effect to manage the display timer loop
  useEffect(() => {
    // Don't start the loop until the queue is ready
    if (isLoading || displayQueue.length === 0) return;

    // Get the current item's duration, with a fallback
    const currentItem = displayQueue[currentIndex];
    const duration = currentItem?.duration > 0 ? currentItem.duration : 5000;

    const timer = setTimeout(() => {
      // Move to the next item
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
      // Reset animation key
      setKey(k => k + 1);
    }, duration);

    // Cleanup the timer when the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [currentIndex, displayQueue, isLoading]);

  const currentItem = displayQueue[currentIndex];

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
              priority={true} // Prioritize loading the visible image
            />
          </div>
        );
      case 'message':
        return (
          <div key={key} className="flex h-full w-full items-center justify-center p-12 bg-background animate-fade-in">
            <div className="relative h-full w-full overflow-hidden">
               <div 
                className="animate-scroll-up absolute bottom-0 flex h-full flex-col justify-center text-center"
                style={{ animationDuration: `${currentItem.scrollDuration}s` }}
              >
                <p className="font-body leading-normal text-foreground" style={{fontSize: `${currentItem.fontSize}px`}}>
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
