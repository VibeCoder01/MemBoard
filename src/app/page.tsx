'use client';

import { useCallback, useState } from 'react';
import { DisplayBoard } from '@/components/display-board';
import { ViewFooter } from '@/components/view-footer';
import { ViewHeader } from '@/components/view-header';
import { cn } from '@/lib/utils';

export default function Home() {
  const [statusMessage, setStatusMessage] = useState('All systems normal.');
  const [isBlankScreen, setIsBlankScreen] = useState(false);

  const handleStatusChange = useCallback((message: string) => {
    setStatusMessage(message);
  }, []);

  const handleBlankScreenChange = useCallback((isBlank: boolean) => {
    setIsBlankScreen(isBlank);
  }, []);

  return (
    <main className="relative flex h-screen w-full flex-col bg-black">
      <div
        className={cn(
          'flex h-full w-full flex-col bg-background transition-opacity duration-1000',
          isBlankScreen ? 'opacity-0' : 'opacity-100'
        )}
      >
        <ViewHeader />
        <div className="flex-1 overflow-hidden">
          <DisplayBoard
            onStatusChange={handleStatusChange}
            onBlankScreenChange={handleBlankScreenChange}
          />
        </div>
        <ViewFooter statusMessage={statusMessage} />
      </div>
    </main>
  );
}
