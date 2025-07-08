
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/lib/data';
import { getMessages, addMessage, updateMessage, deleteMessage } from '@/lib/message-db';
import { triggerViewRefresh } from '@/lib/utils';

const scheduleOptions = ['Always Active', 'Morning', 'Afternoon', 'Evening', 'Night'];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const [newContent, setNewContent] = useState('');
  const [newSchedule, setNewSchedule] = useState('Always Active');
  
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbMessages = await getMessages();
      setMessages(dbMessages);
    } catch (error) {
      console.error("Failed to load messages from database", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load messages.' ,
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);


  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      return;
    }

    const newMessage: Omit<Message, 'id'> = {
      content: newContent,
      schedule: newSchedule || 'Always Active',
      status: 'Active',
    };
    
    try {
        await addMessage(newMessage);
        toast({ title: "Success", description: "New message has been added." });
        setNewContent('');
        setNewSchedule('');
        setIsAddDialogOpen(false);
        fetchMessages(); // Refresh list
        triggerViewRefresh();
    } catch (error) {
        console.error("Failed to add message", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save the new message.' });
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
        await deleteMessage(id);
        toast({ title: "Success", description: "Message has been deleted." });
        fetchMessages();
        triggerViewRefresh();
    } catch (error) {
        console.error("Failed to delete message", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the message.' });
    }
  };

  const handleEditClick = (message: Message) => {
    setEditingMessage({ ...message }); // Create a copy to edit
    setIsEditDialogOpen(true);
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;

    try {
        await updateMessage(editingMessage.id, editingMessage);
        toast({ title: "Success", description: "Message has been updated." });
        setIsEditDialogOpen(false);
        setEditingMessage(null);
        fetchMessages();
        triggerViewRefresh();
    } catch (error) {
        console.error("Failed to update message", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update the message.' });
    }
  };
  
  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingMessage(null);
    }
  };

  if (isLoading) {
      return (
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-10 w-44" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      )
  }

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
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select value={newSchedule} onValueChange={setNewSchedule}>
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="edit-schedule">Schedule</Label>
                  <Select
                    value={editingMessage.schedule}
                    onValueChange={(value) =>
                      setEditingMessage({ ...editingMessage, schedule: value })
                    }
                  >
                    <SelectTrigger id="edit-schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
