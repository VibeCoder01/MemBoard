'use client';

import { useCallback, useState } from 'react';
import { DisplayBoard } from '@/components/display-board';
import { ViewFooter } from '@/components/view-footer';
import { ViewHeader } from '@/components/view-header';

export default function Home() {
  const [statusMessage, setStatusMessage] = useState('All systems normal.');

  const handleStatusChange = useCallback((message: string) => {
    setStatusMessage(message);
  }, []);

  return (
    <main className="flex h-screen w-full flex-col bg-background">
      <ViewHeader />
      <div className="flex-1 overflow-hidden">
        <DisplayBoard onStatusChange={handleStatusChange} />
      </div>
      <ViewFooter statusMessage={statusMessage} />
    </main>
  );
}
