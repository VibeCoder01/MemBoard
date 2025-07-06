
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
import { getMessageCount } from '@/lib/message-db';
import { getPhotoCount } from '@/lib/photo-db';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [messageCount, setMessageCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
          // Load counts from SQLite database
          const [msgCount, phtCount] = await Promise.all([
            getMessageCount(),
            getPhotoCount(),
          ]);
          setMessageCount(msgCount);
          setPhotoCount(phtCount);

        } catch (error) {
          console.error("Failed to load dashboard data", error);
          toast({
              variant: 'destructive',
              title: 'Error Loading Data',
              description: 'Could not connect to the database.'
          });
          setMessageCount(0);
          setPhotoCount(0);
        }
        setIsLoading(false);
    }
    fetchData();
  }, [toast]);

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
