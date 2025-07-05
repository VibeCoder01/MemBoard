"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MOCK_ITEMS = [
  {
    type: 'photo',
    src: 'https://placehold.co/1920x1080',
    duration: 10000,
    alt: 'Serene landscape',
    'data-ai-hint': 'serene landscape',
  },
  {
    type: 'message',
    title: 'Welcome!',
    text: "Welcome to our facility. We're so glad you're here. Please make yourself at home. If you need anything, don't hesitate to ask one of our staff members. We hope you have a wonderful and pleasant stay with us.",
    duration: 15000,
  },
  {
    type: 'photo',
    src: 'https://placehold.co/1920x1080',
    duration: 10000,
    alt: 'Happy family',
    'data-ai-hint': 'happy family',
  },
  {
    type: 'message',
    title: 'Upcoming Event',
    text: 'Join us for our annual summer picnic this Saturday at 12:00 PM in the main garden. There will be food, games, and live music for everyone to enjoy!',
    duration: 15000,
  },
  {
    type: 'blank',
    duration: 3000,
  },
];

type DisplayItem = {
  type: 'photo' | 'message' | 'blank';
  duration: number;
  src?: string;
  alt?: string;
  text?: string;
  title?: string;
  'data-ai-hint'?: string;
};

export function DisplayBoard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState<DisplayItem>(MOCK_ITEMS[0]);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const item = MOCK_ITEMS[currentIndex];
    setIsFading(true);

    const fadeTimeout = setTimeout(() => {
      setCurrentItem(item);
      setIsFading(false);
    }, 1500); // Half of the animation duration

    const nextItemTimeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % MOCK_ITEMS.length);
    }, item.duration);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(nextItemTimeout);
    };
  }, [currentIndex]);

  const renderItem = () => {
    switch (currentItem.type) {
      case 'photo':
        return (
          <div className="relative h-full w-full">
            <Image
              src={currentItem.src!}
              alt={currentItem.alt!}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-1000"
              data-ai-hint={currentItem['data-ai-hint']}
            />
          </div>
        );
      case 'message':
        return (
          <div className="flex h-full w-full items-center justify-center p-12">
            <div className="relative h-full w-full overflow-hidden">
              <div className="animate-scroll-up absolute bottom-0 flex h-full flex-col justify-center">
                <h2 className="font-headline text-7xl font-bold text-primary-foreground mb-8 text-center">
                  {currentItem.title}
                </h2>
                <p className="font-body text-5xl leading-normal text-foreground">
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
      <CardContent
        className={`h-full w-full p-0 transition-opacity duration-1000 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
      >
        {renderItem()}
      </CardContent>
    </Card>
  );
}
