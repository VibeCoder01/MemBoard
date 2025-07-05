"use client";

import { useState, useEffect } from 'react';
import { MountainIcon } from 'lucide-react';

export function ViewHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }));
    }, 1000);

    // Set initial time
    setTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }));

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-20 shrink-0 items-center justify-between bg-primary/20 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <MountainIcon className="h-8 w-8 text-primary-foreground" />
        <h1 className="font-headline text-3xl font-bold text-primary-foreground">
          MemBoard
        </h1>
      </div>
      <div className="font-headline text-4xl font-semibold text-primary-foreground">
        {time}
      </div>
    </header>
  );
}
