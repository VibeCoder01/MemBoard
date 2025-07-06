'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Simplified types for counting purposes.
type Message = { id: number };
type Photo = { id: number };
type PhotoGroups = { [key: string]: Photo[] };

// Default data used if nothing is in localStorage, to match other pages.
const initialMessages: Message[] = [
  { id: 1 }, { id: 2 }, { id: 3 },
];
const initialPhotoGroups: PhotoGroups = {
  family: [{ id: 1 }, { id: 2 }],
  events: [{ id: 3 }],
  scenery: [{ id: 4 }, { id: 5 }, { id: 6 }],
};

export default function DashboardPage() {
  const [messageCount, setMessageCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load and count messages
      const savedMessages = localStorage.getItem('messages');
      if (savedMessages) {
        setMessageCount(JSON.parse(savedMessages).length);
      } else {
        setMessageCount(initialMessages.length);
      }

      // Load and count photos
      const savedPhotos = localStorage.getItem('photoGroups');
      if (savedPhotos) {
        const photoGroups: PhotoGroups = JSON.parse(savedPhotos);
        const totalPhotos = Object.values(photoGroups).reduce(
          (acc, group) => acc + (group?.length || 0),
          0
        );
        setPhotoCount(totalPhotos);
      } else {
         const totalPhotos = Object.values(initialPhotoGroups).reduce(
          (acc, group) => acc + (group?.length || 0),
          0
        );
        setPhotoCount(totalPhotos);
      }

    } catch (error) {
      console.error("Failed to load dashboard data from localStorage", error);
      // Fallback to initial counts on error
      setMessageCount(initialMessages.length);
      setPhotoCount(Object.values(initialPhotoGroups).flat().length);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Welcome back, Admin!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
            ) : (
                <div className="text-2xl font-bold">{messageCount}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <Skeleton className="h-8 w-1/2" />
            ) : (
                <div className="text-2xl font-bold">{photoCount}</div>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
             <Button variant="outline" asChild className="justify-start">
                <Link href="/admin/messages">Manage Messages</Link>
             </Button>
             <Button variant="outline" asChild className="justify-start">
                <Link href="/admin/photos">Manage Photos</Link>
             </Button>
             <Button variant="outline" asChild className="justify-start">
                <Link href="/admin/settings">Configure Settings</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
            <CardTitle>View Mode</CardTitle>
            <CardDescription>Preview the public display board.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="mb-4">You can see what is currently being displayed on the public MemBoard by visiting the home page.</p>
            <Button asChild>
                <Link href="/" target="_blank">
                    Open View Mode <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardContent>
       </Card>

    </div>
  );
}
