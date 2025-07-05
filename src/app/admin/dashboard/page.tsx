import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpRight, MessageSquare, Image as ImageIcon } from 'lucide-react';

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 active this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">
              +5 uploaded this month
            </p>
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
