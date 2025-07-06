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
  const [currentItem, setCurrentItem] = useState<DisplayItem | null>(null);
  const [displayQueue, setDisplayQueue] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // To reset animations

  // Effect to load data and build the queue once
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
      const parsedPhotos = savedPhotos ? JSON.parse(savedPhotos) : initialPhotoGroups;
      photoGroups = (parsedPhotos && Object.keys(parsedPhotos).length > 0) ? parsedPhotos : initialPhotoGroups;

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
        let photoList: Photo[] = Object.values(photoGroups).flat().filter(p => p && p.src);

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
        
        const photoItems: DisplayItem[] = photoList
          .filter(p => p && p.src) // extra safety check
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
        
        // Calculate message duration based on text length and scroll speed
        const getMessageDuration = (text: string) => {
            const wordCount = text.split(/\s+/).length;
            // Slower speed (higher slider value) means longer duration
            const speedFactor = 150 - settings.scrollSpeed; // e.g., 50 -> 100, 100 -> 50
            return (wordCount * 0.5 + 5) * (speedFactor / 50) * 1000;
        };

        const messageItems: DisplayItem[] = activeMessages.map(m => {
            const duration = getMessageDuration(m.content);
            return {
                type: 'message',
                text: m.content,
                duration: duration,
                fontSize: settings.messageFontSize,
                scrollDuration: duration / 1000,
            };
        });
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
    if (isLoading || displayQueue.length === 0) {
      setCurrentItem(null);
      return;
    }
    
    setCurrentItem(displayQueue[currentIndex]);
    setKey(k => k + 1);
    
    const currentItemInEffect = displayQueue[currentIndex];
    const duration = currentItemInEffect?.duration > 0 ? currentItemInEffect.duration : 5000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, displayQueue, isLoading]);

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
        const style = {
          '--scroll-duration': `${currentItem.scrollDuration}s`,
        } as React.CSSProperties;

        return (
          <div key={key} className="flex h-full w-full items-center justify-center p-12 bg-background animate-fade-in">
            <div className="relative h-full w-full overflow-hidden">
               <div
                className="animate-scroll-message absolute flex h-full w-full flex-col justify-center text-center"
                style={style}
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
