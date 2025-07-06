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
  displayPhotos: boolean;
  displayMessages: boolean;
  useBlankScreens: boolean;
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
  displayPhotos: true,
  displayMessages: true,
  useBlankScreens: true,
};

const initialMessages: Message[] = [
  {
    id: 1,
    content: 'Welcome to our facility. We are glad to have you.',
    schedule: 'Always Active',
    status: 'Active',
  },
  {
    id: 2,
    content: 'Annual summer picnic this Saturday at 12:00 PM.',
    schedule: '2024-07-20 to 2024-07-27',
    status: 'Scheduled',
  },
  {
    id: 3,
    content: 'Movie night tonight in the common room at 7 PM.',
    schedule: '2024-07-22',
    status: 'Expired',
  },
];

const initialPhotoGroups = {
  family: [
    {
      id: 1,
      src: 'https://placehold.co/400x300',
      alt: 'Family at the beach',
      'data-ai-hint': 'family beach',
    },
    {
      id: 2,
      src: 'https://placehold.co/400x300',
      alt: 'Grandparents smiling',
      'data-ai-hint': 'old couple',
    },
  ],
  events: [
    {
      id: 3,
      src: 'https://placehold.co/400x300',
      alt: 'Birthday party',
      'data-ai-hint': 'birthday party',
    },
  ],
  scenery: [
    {
      id: 4,
      src: 'https://placehold.co/400x300',
      alt: 'Mountain landscape',
      'data-ai-hint': 'mountain landscape',
    },
    {
      id: 5,
      src: 'https://placehold.co/400x300',
      alt: 'City skyline at night',
      'data-ai-hint': 'city night',
    },
    {
      id: 6,
      src: 'https://placehold.co/400x300',
      alt: 'Forest path',
      'data-ai-hint': 'forest path',
    },
  ],
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
      messages = savedMessages ? JSON.parse(savedMessages) : initialMessages;
      
      const savedPhotos = localStorage.getItem('photoGroups');
      photoGroups = (savedPhotos && savedPhotos !== '{}') ? JSON.parse(savedPhotos) : initialPhotoGroups;

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      settings = defaultSettings;
      messages = initialMessages;
      photoGroups = initialPhotoGroups;
    }
    
    let itemsToDisplay: DisplayItem[] = [];

    // Process and add photos IF enabled
    if (settings.displayPhotos) {
        let allPhotos: Photo[] = [];
        if (settings.randomizeAllPhotos) {
          allPhotos = Object.values(photoGroups).flat();
          if(settings.randomize || settings.randomizeInPhotoGroups) {
            allPhotos = shuffle(allPhotos);
          }
        } else {
          const categories = Object.keys(photoGroups);
          for (const category of categories) {
            let groupPhotos = photoGroups[category] || [];
            if (settings.randomizeInPhotoGroups) {
              groupPhotos = shuffle(groupPhotos);
            }
            allPhotos.push(...groupPhotos);
          }
        }
        
        const photoItems: DisplayItem[] = allPhotos
          .filter(p => p && p.src) // Safeguard against invalid photo data
          .map(p => ({
            type: 'photo',
            src: p.src,
            alt: p.alt,
            'data-ai-hint': p['data-ai-hint'],
            duration: settings.photoDuration * 1000
          }));
        itemsToDisplay.push(...photoItems);
    }
    
    // Process and add messages IF enabled
    if (settings.displayMessages) {
        const activeMessages = messages.filter(m => m.status === 'Active');
        const scrollDuration = 60 - (settings.scrollSpeed / 100) * 50; 
        const messageItems: DisplayItem[] = activeMessages.map(m => ({
          type: 'message',
          text: m.content,
          duration: settings.messageDuration * 1000,
          fontSize: settings.messageFontSize,
          scrollDuration: scrollDuration,
        }));
        itemsToDisplay.push(...messageItems);
    }
    
    // Shuffle if global randomize is on
    if (settings.randomize) {
      itemsToDisplay = shuffle(itemsToDisplay);
    }
    
    // Build final queue with blanks interspersed
    const finalQueue: DisplayItem[] = [];
    if (itemsToDisplay.length > 0) {
      itemsToDisplay.forEach((item, index) => {
        finalQueue.push(item);
        // Add blank screen if enabled and not the last item
        if (settings.useBlankScreens && settings.blankDuration > 0 && index < itemsToDisplay.length - 1) {
            finalQueue.push({ type: 'blank', duration: settings.blankDuration * 1000 });
        }
      });
    }
    
    setDisplayQueue(finalQueue);
    if (finalQueue.length > 0) {
        setCurrentItem(finalQueue[0]);
    }
    setIsLoading(false);
  }, []);

  // Main display loop effect
  useEffect(() => {
    if (isLoading || displayQueue.length === 0) {
      return; 
    }

    const item = displayQueue[currentIndex];
    setCurrentItem(item);

    // Safeguard against zero or negative duration
    const duration = item && item.duration > 0 ? item.duration : 5000;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % displayQueue.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, displayQueue, isLoading]);


  const renderItem = () => {
    if(isLoading) {
        return <div className="flex h-full w-full items-center justify-center"><p className="text-2xl text-muted-foreground">Initializing MemBoard...</p></div>;
    }
    if (displayQueue.length === 0) {
        return <div className="flex h-full w-full items-center justify-center text-center p-8"><p className="text-2xl text-muted-foreground">No content to display. Add photos or "Active" messages in the admin panel.</p></div>;
    }
    if (!currentItem) {
      return null; // Should not happen after loading if queue is not empty, but good practice
    }

    switch (currentItem.type) {
      case 'photo':
        return (
          <div className="relative h-full w-full animate-fade-in">
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
        // Render a blank screen, which is just the background
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
