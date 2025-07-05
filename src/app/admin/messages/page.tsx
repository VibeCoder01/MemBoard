'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Message = {
  id: number;
  content: string;
  schedule: string;
  status: string;
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

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const [newContent, setNewContent] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      content: newContent,
      schedule: newSchedule || 'Always Active',
      status: 'Active',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setNewContent('');
    setNewSchedule('');
    setIsAddDialogOpen(false);
  };

  const handleDeleteMessage = (id: number) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };

  const handleEditClick = (message: Message) => {
    setEditingMessage({ ...message }); // Create a copy to edit
    setIsEditDialogOpen(true);
  };

  const handleUpdateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === editingMessage.id ? editingMessage : msg
      )
    );
    setIsEditDialogOpen(false);
    setEditingMessage(null);
  };
  
  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingMessage(null);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Message Management
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Message</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdateMessage}>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Update the details for the message.
              </DialogDescription>
            </DialogHeader>
            {editingMessage && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Message Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editingMessage.content}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        content: e.target.value,
                      })
                    }
                    placeholder="Type your message here."
                    required
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-schedule">Schedule (Optional)</Label>
                  <Input
                    id="edit-schedule"
                    value={editingMessage.schedule}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        schedule: e.target.value,
                      })
                    }
                    placeholder="e.g., Always Active, or 2024-08-15"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleEditDialogChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(msg)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the message.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMessage(msg.id)}
                            className={buttonVariants({ variant: 'destructive' })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
