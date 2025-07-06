"use client";

import { useState, useEffect } from 'react';

export function ViewFooter({ statusMessage }: { statusMessage: string }) {
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      setDate(new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    };

    updateDate();
    const timer = setInterval(updateDate, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="flex h-16 shrink-0 items-center justify-between bg-secondary/80 pl-24 pr-6 backdrop-blur-sm">
      <div className="font-body text-xl text-secondary-foreground truncate" title={statusMessage}>
        {statusMessage}
      </div>
      <div className="font-body text-xl font-medium text-secondary-foreground">
        {date}
      </div>
    </footer>
  );
}
