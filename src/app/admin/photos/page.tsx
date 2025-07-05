
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Settings } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  [key: string]: Photo[];
};

export default function PhotosPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroups>({});
  const [activeTab, setActiveTab] = useState('');

  // Load from localStorage on component mount
  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem('photoGroups');
      if (savedGroups && savedGroups !== '{}') {
        setPhotoGroups(JSON.parse(savedGroups));
      } else {
        setPhotoGroups(initialPhotoGroups);
      }
    } catch (error) {
      console.error('Failed to load photo groups from localStorage', error);
      setPhotoGroups(initialPhotoGroups);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever photoGroups changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('photoGroups', JSON.stringify(photoGroups));
    }
  }, [photoGroups, isLoading]);

  // Keep activeTab in sync with available categories
  useEffect(() => {
    if (!isLoading) {
      const categories = Object.keys(photoGroups);
      if (categories.length > 0 && !categories.includes(activeTab)) {
        setActiveTab(categories[0]);
      } else if (categories.length === 0) {
        setActiveTab('');
      }
    }
  }, [photoGroups, isLoading, activeTab]);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoAlt, setNewPhotoAlt] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState(activeTab);
  const [editingPhotoCategory, setEditingPhotoCategory] = useState(activeTab);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);

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
      const newGroups = JSON.parse(JSON.stringify(prev));

      for (const category in newGroups) {
        newGroups[category] = newGroups[category].filter(
          (p: Photo) => p.id !== editingPhoto.id
        );
      }

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

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryInput.trim();
    if (trimmedName && !photoGroups.hasOwnProperty(trimmedName)) {
      setPhotoGroups((prev) => ({
        ...prev,
        [trimmedName]: [],
      }));
      setActiveTab(trimmedName);
      setNewCategoryInput('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name cannot be empty or already exist.',
      });
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (Object.keys(photoGroups).length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete',
        description: 'You must have at least one category.',
      });
      return;
    }

    if (activeTab === categoryName) {
      const remainingCategories = Object.keys(photoGroups).filter(
        (c) => c !== categoryName
      );
      setActiveTab(remainingCategories[0]);
    }

    setPhotoGroups((prev) => {
      const newGroups = { ...prev };
      delete newGroups[categoryName];
      return newGroups;
    });
  };

  const handleStartRename = (name: string) => {
    setRenamingCategory({ oldName: name, newName: name });
  };

  const handleRenameCategory = () => {
    if (!renamingCategory) return;
    const { oldName, newName } = renamingCategory;
    const trimmedNewName = newName.trim();

    if (
      !trimmedNewName ||
      (trimmedNewName !== oldName && photoGroups.hasOwnProperty(trimmedNewName))
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Category name cannot be empty or already exist.',
      });
      return;
    }

    if (trimmedNewName === oldName) {
      setRenamingCategory(null);
      return;
    }

    setPhotoGroups((prev) => {
      const newGroups = { ...prev };
      const entries = Object.entries(newGroups);
      const index = entries.findIndex(([key]) => key === oldName);
      if (index !== -1) {
          const photos = newGroups[oldName];
          delete newGroups[oldName];
          const newEntries = [
              ...entries.slice(0, index),
              [trimmedNewName, photos],
              ...entries.slice(index + 1),
          ];
          return Object.fromEntries(newEntries);
      }
      return newGroups;
    });
    
    if (activeTab === oldName) {
      setActiveTab(trimmedNewName);
    }

    setRenamingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-9 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 border-b pb-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="py-12 text-center text-muted-foreground">
              <p>Loading photo library...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Photo Management
        </h1>
        <div className="flex items-center gap-2">
          <Dialog
            open={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Photo Categories</DialogTitle>
                <DialogDescription>
                  Add, rename, or delete your photo categories here.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="py-4">
                <Label
                  htmlFor="new-category-name"
                  className="text-sm font-medium"
                >
                  Add New Category
                </Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="new-category-name"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="e.g., Holidays"
                  />
                  <Button type="submit">Add</Button>
                </div>
              </form>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Categories</h4>
                <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                  {Object.keys(photoGroups).map((category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      {renamingCategory?.oldName === category ? (
                        <div className="flex w-full items-center gap-2">
                          <Input
                            value={renamingCategory.newName}
                            onChange={(e) =>
                              setRenamingCategory({
                                ...renamingCategory,
                                newName: e.target.value,
                              })
                            }
                            className="h-8"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleRenameCategory();
                                }
                            }}
                          />
                          <Button size="sm" onClick={handleRenameCategory}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRenamingCategory(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartRename(category)}
                            >
                              Rename
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  disabled={
                                    Object.keys(photoGroups).length <= 1
                                  }
                                >
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will permanently delete the "
                                    {category}" category and all photos within
                                    it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className={buttonVariants({
                                      variant: 'destructive',
                                    })}
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCategoryDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={(isOpen) => {
              setIsUploadDialogOpen(isOpen);
              if (isOpen) {
                setNewPhotoCategory(activeTab);
              }
            }}
          >
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
                        {Object.keys(photoGroups).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
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
                      {Object.keys(photoGroups).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              {Object.keys(photoGroups).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(photoGroups).map(([category, photos]) => (
              <TabsContent key={category} value={category} className="mt-4">
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((p) => (
                      <PhotoCard
                        key={p.id}
                        photo={p}
                        onDelete={handleDeletePhoto}
                        onEdit={handleEditClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <p>This category is empty.</p>
                    <p className="text-sm">
                      Upload a photo to add it to this category.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
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
