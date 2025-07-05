"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Types
type Message = {
  id: number;
  content: string;
  schedule: string;
  status: 'Active' | 'Scheduled' | 'Expired';
};

type Photo = {
  id: number;
  src: string;
  alt: string;
  'data-ai-hint': string;
};

type PhotoGroups = {
  [key: string]: Photo[];
};

type Settings = {
  photoDuration: number;
  messageDuration: number;
  blankDuration: number;
  randomize: boolean;
  scrollSpeed: number;
  randomizeAllPhotos: boolean;
  randomizeInPhotoGroups: boolean;
  messageFontSize: number;
};

const defaultSettings: Settings = {
  photoDuration: 10,
  messageDuration: 15,
  blankDuration: 3,
  randomize: false,
  scrollSpeed: 50,
  randomizeAllPhotos: false,
  randomizeInPhotoGroups: true,
  messageFontSize: 48,
};

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
  let currentIndex = array.length, randomIndex;
  const newArray = [...array];
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
  }
  return newArray;
};

export function DisplayBoard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<DisplayItem | null>(null);
  const [displayQueue, setDisplayQueue] = useState<DisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from localStorage on mount and build the display queue
  useEffect(() => {
    let settings: Settings;
    let messages: Message[];
    let photoGroups: PhotoGroups;

    try {
      const savedSettings = localStorage.getItem('displaySettings');
      settings = savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
      
      const savedMessages = localStorage.getItem('messages');
      messages = savedMessages ? JSON.parse(savedMessages) : [];
      
      const savedPhotos = localStorage.getItem('photoGroups');
      photoGroups = savedPhotos ? JSON.parse(savedPhotos) : {};
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      settings = defaultSettings;
      messages = [];
      photoGroups = {};
    }
    
    // Process photos based on settings
    let photos: Photo[] = [];
    if (settings.randomizeAllPhotos) {
      photos = Object.values(photoGroups).flat();
      if(settings.randomize || settings.randomizeInPhotoGroups) { // If either is true, shuffle the flattened list
          photos = shuffle(photos);
      }
    } else {
      const categories = Object.keys(photoGroups);
      for (const category of categories) {
        let groupPhotos = photoGroups[category] || [];
        if (settings.randomizeInPhotoGroups) {
          groupPhotos = shuffle(groupPhotos);
        }
        photos.push(...groupPhotos);
      }
    }
    
    // Filter for active messages
    const activeMessages = messages.filter(m => m.status === 'Active');
    
    // Map to DisplayItem format
    const photoItems: DisplayItem[] = photos.map(p => ({
      type: 'photo',
      src: p.src,
      alt: p.alt,
      'data-ai-hint': p['data-ai-hint'],
      duration: settings.photoDuration * 1000
    }));

    // Slower scroll speed = longer duration
    const scrollDuration = 60 - (settings.scrollSpeed / 100) * 50; 
    const messageItems: DisplayItem[] = activeMessages.map(m => ({
      type: 'message',
      text: m.content,
      duration: settings.messageDuration * 1000,
      fontSize: settings.messageFontSize,
      scrollDuration: scrollDuration,
    }));
    
    // Combine and shuffle if global randomize is on
    let combinedItems: DisplayItem[] = [...photoItems, ...messageItems];
    if (settings.randomize) {
      combinedItems = shuffle(combinedItems);
    }
    
    // Intersperse blank items
    const finalQueue: DisplayItem[] = [];
    if (combinedItems.length > 0) {
      combinedItems.forEach((item) => {
        finalQueue.push(item);
        if (settings.blankDuration > 0) {
            finalQueue.push({ type: 'blank', duration: settings.blankDuration * 1000 });
        }
      });
      // Remove the last blank item as it's redundant
      if (settings.blankDuration > 0) {
          finalQueue.pop();
      }
    }
    
    setDisplayQueue(finalQueue);
    setIsLoading(false);
  }, []);

  // Cycle through the queue
  useEffect(() => {
    if (isLoading || displayQueue.length === 0) return;

    const item = displayQueue[currentIndex];
    if (!item) return;

    setCurrentItem(item);

    const nextItemTimeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, item.duration);

    return () => {
      clearTimeout(nextItemTimeout);
    };
  }, [currentIndex, displayQueue, isLoading]);


  const renderItem = () => {
    if(isLoading || !currentItem) {
        return <div className="flex h-full w-full items-center justify-center"><p className="text-2xl text-muted-foreground">Initializing MemBoard...</p></div>;
    }
    if (displayQueue.length === 0 && !isLoading) {
        return <div className="flex h-full w-full items-center justify-center text-center p-8"><p className="text-2xl text-muted-foreground">No content to display. Add photos or "Active" messages in the admin panel.</p></div>;
    }

    switch (currentItem.type) {
      case 'photo':
        return (
          <div className="relative h-full w-full">
            <Image
              key={currentItem.src}
              src={currentItem.src!}
              alt={currentItem.alt!}
              fill={true}
              style={{ objectFit: 'cover' }}
              data-ai-hint={currentItem['data-ai-hint']}
              priority={true}
            />
          </div>
        );
      case 'message':
        return (
          <div className="flex h-full w-full items-center justify-center p-12 bg-background">
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
        return null;
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
