
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
import type { Photo, PhotoGroups } from '@/lib/data';
import { initialPhotoGroups } from '@/lib/data';

export default function PhotosPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroups>({});
  const [activeTab, setActiveTab] = useState('');

  // Load from localStorage on component mount and clean up duplicates
  useEffect(() => {
    try {
      const savedGroupsJSON = localStorage.getItem('photoGroups');
      let loadedGroups: PhotoGroups;

      if (savedGroupsJSON && savedGroupsJSON !== '{}') {
        loadedGroups = JSON.parse(savedGroupsJSON);
      } else {
        loadedGroups = initialPhotoGroups;
      }
      
      // De-duplicate photos to fix legacy data issues.
      // This is the key part of the fix for existing bad data.
      const seenIds = new Set<string>();
      const cleanedGroups: PhotoGroups = {};
      for (const category in loadedGroups) {
          if (Array.isArray(loadedGroups[category])) {
            cleanedGroups[category] = [];
            for (const photo of loadedGroups[category]) {
                const photoId = photo?.id?.toString();
                if (photoId && !seenIds.has(photoId)) {
                    // Create a new photo object with the ID as a string to migrate old data.
                    const cleanedPhoto: Photo = {...photo, id: photoId};
                    cleanedGroups[category].push(cleanedPhoto);
                    seenIds.add(photoId);
                }
            }
          }
      }

      setPhotoGroups(cleanedGroups);

    } catch (error) {
      console.error('Failed to load or clean photo groups from localStorage', error);
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

  const [newPhotoFiles, setNewPhotoFiles] = useState<FileList | null>(null);
  const [newPhotoCategory, setNewPhotoCategory] = useState(activeTab);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingPhotoCategory, setEditingPhotoCategory] = useState(activeTab);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPhotoFiles(e.target.files);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoFiles || newPhotoFiles.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No files selected',
        description: 'Please select one or more photos to upload.',
      });
      return;
    }

    let targetCategory = newPhotoCategory;
    if (targetCategory === '__NEW__') {
      const trimmedName = newCategoryName.trim();
      if (!trimmedName) {
        toast({
          variant: 'destructive',
          title: 'Invalid Category Name',
          description: 'New category name cannot be empty.',
        });
        return;
      }
      if (photoGroups.hasOwnProperty(trimmedName)) {
        toast({
          variant: 'destructive',
          title: 'Category Exists',
          description: 'A category with this name already exists.',
        });
        return;
      }
      targetCategory = trimmedName;
    }

    if (!targetCategory) {
      toast({
        variant: 'destructive',
        title: 'No Category',
        description: 'Please select or create a category for the photos.',
      });
      return;
    }

    const filesArray = Array.from(newPhotoFiles);
    
    const readFileAsDataURL = (file: File): Promise<Photo> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const altText = file.name
            .substring(0, file.name.lastIndexOf('.'))
            .replace(/[-_]/g, ' ');
          resolve({
            id: crypto.randomUUID(), // Robust unique ID generation
            src,
            alt: altText,
            'data-ai-hint': altText
              .toLowerCase()
              .split(' ')
              .slice(0, 2)
              .join(' '),
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const newPhotos = await Promise.all(
        filesArray.map(file => readFileAsDataURL(file))
      );

      setPhotoGroups((prev) => {
        const newGroups = { ...prev };
        if (!newGroups[targetCategory]) {
          newGroups[targetCategory] = [];
        }
        newGroups[targetCategory].push(...newPhotos);
        return newGroups;
      });

      if (newPhotoCategory === '__NEW__') {
        setActiveTab(targetCategory);
      }

      toast({
        title: 'Upload Complete',
        description: `${filesArray.length} photo(s) added to "${targetCategory}".`,
      });

      // Reset form and close dialog
      setNewPhotoFiles(null);
      const fileInput = document.getElementById(
        'photo-file'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setNewCategoryName('');
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Failed to read files for upload', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description:
          'There was an error processing the photos. Please try again.',
      });
    }
  };

  const handleDeletePhoto = (id: string) => {
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
          const reorderedGroups: PhotoGroups = {};
          for (const [key, value] of newEntries) {
            reorderedGroups[key] = value;
          }
          return reorderedGroups;
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
              <p>Loading and cleaning photo library...</p>
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
                // Reset form state when dialog opens
                const initialCategory = activeTab || Object.keys(photoGroups)[0] || '';
                setNewPhotoCategory(initialCategory);
                setNewCategoryName('');
                setNewPhotoFiles(null);
                const fileInput = document.getElementById('photo-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Photos
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleUploadPhoto}>
                <DialogHeader>
                  <DialogTitle>Add Photos</DialogTitle>
                  <DialogDescription>
                    Select one or more photos from your device, choose a
                    category, and upload.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo-file">Photo File(s)</Label>
                    <Input
                      id="photo-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      multiple
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newPhotoCategory}
                      onValueChange={setNewPhotoCategory}
                      required
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
                        <Separator />
                        <SelectItem value="__NEW__">
                          -- Create new category --
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   {newPhotoCategory === '__NEW__' && (
                    <div className="space-y-2">
                      <Label htmlFor="new-category-name-upload">New Category Name</Label>
                      <Input
                        id="new-category-name-upload"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Vacation 2024"
                        required
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Photos</Button>
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
                      Use the "Add Photos" button to upload photos to this
                      category.
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
  onDelete: (id: string) => void;
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
      <CardContent className="p-2 flex items-start justify-between gap-2">
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate" title={alt}>
            {alt}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={id}>
            ID: {id}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
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
