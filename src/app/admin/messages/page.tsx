import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const messages = [
  { id: 1, content: 'Welcome to our facility. We are glad to have you.', schedule: 'Always Active', status: 'Active' },
  { id: 2, content: 'Annual summer picnic this Saturday at 12:00 PM.', schedule: '2024-07-20 to 2024-07-27', status: 'Scheduled' },
  { id: 3, content: 'Movie night tonight in the common room at 7 PM.', schedule: '2024-07-22', status: 'Expired' },
]

export default function MessagesPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Message Management
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Message
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Messages</CardTitle>
          <CardDescription>
            Here you can create, edit, and manage all messages displayed on the board.
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
                  <TableCell className="font-medium max-w-sm truncate">{msg.content}</TableCell>
                  <TableCell>{msg.schedule}</TableCell>
                  <TableCell>{msg.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
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
