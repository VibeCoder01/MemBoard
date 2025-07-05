'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const initialMessages = [
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

export default function MessagesPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      content: newContent,
      schedule: newSchedule || 'Always Active',
      status: 'Active',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setNewContent('');
    setNewSchedule('');
    setIsDialogOpen(false);
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Message Management
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddMessage}>
              <DialogHeader>
                <DialogTitle>Add New Message</DialogTitle>
                <DialogDescription>
                  Enter the details for the new message. It will be displayed on
                  the board.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Message Content</Label>
                  <Textarea
                    id="content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Type your message here."
                    required
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input
                    id="schedule"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    placeholder="e.g., Always Active, or 2024-08-15"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Message</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Messages</CardTitle>
          <CardDescription>
            Here you can create, edit, and manage all messages displayed on the
            board.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="max-w-sm truncate font-medium">
                    {msg.content}
                  </TableCell>
                  <TableCell>{msg.schedule}</TableCell>
                  <TableCell>{msg.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}