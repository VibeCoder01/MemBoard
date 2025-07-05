'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const initialPhotoGroups = {
  family: [
    {
      id: 1,
      src: 'https://placehold.co/400x300',
      alt: 'Family at the beach',
      'data-ai-hint': 'family beach',
    },
    {
      id: 2,
      src: 'https://placehold.co/400x300',
      alt: 'Grandparents smiling',
      'data-ai-hint': 'old couple',
    },
  ],
  events: [
    {
      id: 3,
      src: 'https://placehold.co/400x300',
      alt: 'Birthday party',
      'data-ai-hint': 'birthday party',
    },
  ],
  scenery: [
    {
      id: 4,
      src: 'https://placehold.co/400x300',
      alt: 'Mountain landscape',
      'data-ai-hint': 'mountain landscape',
    },
    {
      id: 5,
      src: 'https://placehold.co/400x300',
      alt: 'City skyline at night',
      'data-ai-hint': 'city night',
    },
    {
      id: 6,
      src: 'https://placehold.co/400x300',
      alt: 'Forest path',
      'data-ai-hint': 'forest path',
    },
  ],
};

type Photo = {
  id: number;
  src: string;
  alt: string;
  'data-ai-hint': string;
};

type PhotoGroups = {
  family: Photo[];
  events: Photo[];
  scenery: Photo[];
  [key: string]: Photo[];
};

export default function PhotosPage() {
  const [photoGroups, setPhotoGroups] =
    useState<PhotoGroups>(initialPhotoGroups);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoAlt, setNewPhotoAlt] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('family');
  const [editingPhotoCategory, setEditingPhotoCategory] = useState('family');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhotoFile(e.target.files[0]);
    }
  };

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoFile || !newPhotoAlt.trim()) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const newPhoto = {
        id: Date.now(),
        src,
        alt: newPhotoAlt,
        'data-ai-hint': newPhotoAlt
          .toLowerCase()
          .split(' ')
          .slice(0, 2)
          .join(' '),
      };

      setPhotoGroups((prev) => ({
        ...prev,
        [newPhotoCategory]: [...(prev[newPhotoCategory] || []), newPhoto],
      }));

      // Reset form and close dialog
      setNewPhotoFile(null);
      const fileInput = document.getElementById(
        'photo-file'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setNewPhotoAlt('');
      setNewPhotoCategory('family');
      setIsUploadDialogOpen(false);
    };
    reader.readAsDataURL(newPhotoFile);
  };

  const handleDeletePhoto = (id: number) => {
    setPhotoGroups((prev) => {
      const newGroups = { ...prev };
      for (const category in newGroups) {
        newGroups[category] = newGroups[category].filter((p) => p.id !== id);
      }
      return newGroups;
    });
  };

  const handleEditClick = (photo: Photo) => {
    setEditingPhoto({ ...photo });
    for (const category in photoGroups) {
      if (photoGroups[category].some((p) => p.id === photo.id)) {
        setEditingPhotoCategory(category);
        break;
      }
    }
    setIsEditDialogOpen(true);
  };

  const handleUpdatePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    setPhotoGroups((prev) => {
      const newGroups = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation issues

      // Remove photo from all categories first
      for (const category in newGroups) {
        newGroups[category] = newGroups[category].filter(
          (p: Photo) => p.id !== editingPhoto.id
        );
      }

      // Add updated photo to the new category
      if (!newGroups[editingPhotoCategory]) {
        newGroups[editingPhotoCategory] = [];
      }
      newGroups[editingPhotoCategory].push(editingPhoto);
      return newGroups;
    });

    setIsEditDialogOpen(false);
    setEditingPhoto(null);
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingPhoto(null);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Photo Management
        </h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleUploadPhoto}>
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
                <DialogDescription>
                  Select a photo from your device and add details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="photo-file">Photo File</Label>
                  <Input
                    id="photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Description (Alt Text)</Label>
                  <Input
                    id="alt-text"
                    value={newPhotoAlt}
                    onChange={(e) => setNewPhotoAlt(e.target.value)}
                    placeholder="e.g., Family at the beach"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPhotoCategory}
                    onValueChange={setNewPhotoCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="scenery">Scenery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Photo</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdatePhoto}>
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
              <DialogDescription>Update the photo details.</DialogDescription>
            </DialogHeader>
            {editingPhoto && (
              <div className="grid gap-4 py-4">
                <div className="relative aspect-video w-full">
                  <Image
                    src={editingPhoto.src}
                    alt={editingPhoto.alt}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-alt-text">Description (Alt Text)</Label>
                  <Input
                    id="edit-alt-text"
                    value={editingPhoto.alt}
                    onChange={(e) =>
                      setEditingPhoto({
                        ...editingPhoto,
                        alt: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingPhotoCategory}
                    onValueChange={setEditingPhotoCategory}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="scenery">Scenery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialogChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Photo Library</CardTitle>
          <CardDescription>
            Upload, organize, and manage the photos displayed on the board.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="family" className="w-full">
            <TabsList>
              <TabsTrigger value="family">Family</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="scenery">Scenery</TabsTrigger>
            </TabsList>
            <TabsContent value="family">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.family.map((p) => (
                  <PhotoCard
                    key={p.id}
                    photo={p}
                    onDelete={handleDeletePhoto}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="events">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.events.map((p) => (
                  <PhotoCard
                    key={p.id}
                    photo={p}
                    onDelete={handleDeletePhoto}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="scenery">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photoGroups.scenery.map((p) => (
                  <PhotoCard
                    key={p.id}
                    photo={p}
                    onDelete={handleDeletePhoto}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PhotoCard({
  photo,
  onDelete,
  onEdit,
}: {
  photo: Photo;
  onDelete: (id: number) => void;
  onEdit: (photo: Photo) => void;
}) {
  const { id, src, alt, 'data-ai-hint': dataAiHint } = photo;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image
          src={src}
          alt={alt}
          layout="fill"
          objectFit="cover"
          data-ai-hint={dataAiHint}
        />
      </div>
      <CardContent className="p-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground truncate">{alt}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(photo)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this photo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className={buttonVariants({ variant: 'destructive' })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
