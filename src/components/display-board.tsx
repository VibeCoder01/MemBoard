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

  // Load data and build the display queue
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

    if (settings.displayPhotos) {
        let photoList: Photo[] = [];
        // Flatten all groups into a single list
        photoList = Object.values(photoGroups).flat();
        
        // Handle randomization logic
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
        
        // Create display items only from valid photos
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
        if (settings.useBlankScreens && settings.blankDuration > 0 && index < contentItems.length - 1) {
            finalQueue.push({ type: 'blank', duration: (settings.blankDuration || 3) * 1000 });
        }
      });
    }
    
    // 5. Set state
    setDisplayQueue(finalQueue);
    if (finalQueue.length > 0) {
      setCurrentItem(finalQueue[0]);
    }
    setIsLoading(false);
  }, []);

  // Main display loop effect
  useEffect(() => {
    if (isLoading || displayQueue.length === 0) return;

    const item = displayQueue[currentIndex];
    setCurrentItem(item);

    const duration = item && item.duration > 0 ? item.duration : 5000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, displayQueue, isLoading]);


  const renderItem = () => {
    if (isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><p className="text-2xl text-muted-foreground">Initializing MemBoard...</p></div>;
    }
    if (displayQueue.length === 0 || !currentItem) {
        return <div className="flex h-full w-full items-center justify-center text-center p-8"><p className="text-2xl text-muted-foreground">No content to display. Enable photos or messages in the admin panel.</p></div>;
    }

    switch (currentItem.type) {
      case 'photo':
        // Safeguard against rendering an image without a source
        if (!currentItem.src) {
            return <div className="h-full w-full bg-background animate-fade-in" />;
        }
        return (
          <div className="relative h-full w-full animate-fade-in">
            <Image
              key={currentItem.src}
              src={currentItem.src}
              alt={currentItem.alt || ''}
              fill={true}
              style={{ objectFit: 'cover' }}
              data-ai-hint={currentItem['data-ai-hint']}
              priority={true}
            />
          </div>
        );
      case 'message':
        return (
          <div className="flex h-full w-full items-center justify-center p-12 bg-background animate-fade-in">
            <div className="relative h-full w-full overflow-hidden">
               <div 
                key={currentItem.text}
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
        return <div className="h-full w-full bg-background animate-fade-in" />;
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
