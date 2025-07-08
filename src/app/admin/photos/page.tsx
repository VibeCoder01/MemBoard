
'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { Photo, PhotoGroups } from '@/lib/data';
import {
  getPhotoGroups,
  addPhotos,
  deletePhoto,
  deletePhotos,
  updatePhoto,
  renamePhotoCategory,
  deletePhotoCategory,
} from '@/lib/photo-db';
import { triggerViewRefresh } from '@/lib/utils';

export default function PhotosPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [photoGroups, setPhotoGroups] = useState<PhotoGroups>({});
  const [activeTab, setActiveTab] = useState('');
  
  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const groups = await getPhotoGroups();
      setPhotoGroups(groups);
    } catch (error) {
      console.error('Failed to load photo groups from database', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your photo library.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    const categories = Object.keys(photoGroups);
    if (categories.length > 0) {
      setActiveTab((current) =>
        categories.includes(current) ? current : categories[0]
      );
    } else {
      setActiveTab('');
    }
  }, [photoGroups]);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const [newPhotoFiles, setNewPhotoFiles] = useState<FileList | null>(null);
  const [newPhotoCategory, setNewPhotoCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingPhotoCategory, setEditingPhotoCategory] = useState('');

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<{
    oldName: string;
    newName: string;
  } | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
        toast({ variant: 'destructive', title: 'Invalid Category Name', description: 'New category name cannot be empty.' });
        return;
      }
      if (photoGroups.hasOwnProperty(trimmedName)) {
        toast({ variant: 'destructive', title: 'Category Exists', description: 'A category with this name already exists.' });
        return;
      }
      targetCategory = trimmedName;
    }

    if (!targetCategory) {
      toast({ variant: 'destructive', title: 'No Category', description: 'Please select or create a category for the photos.' });
      return;
    }

    const filesArray = Array.from(newPhotoFiles);

    try {
      const { inserted, duplicates } = await addPhotos(filesArray, targetCategory);

      const message = `${inserted.length} photo(s) added to "${targetCategory}".` +
        (duplicates.length > 0 ? ` ${duplicates.length} duplicate file(s) were skipped.` : '');

      toast({ title: 'Upload Complete', description: message });
      setNewPhotoFiles(null);
      const fileInput = document.getElementById('photo-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setNewCategoryName('');
      setIsUploadDialogOpen(false);
      fetchPhotos();
      triggerViewRefresh();
      if (newPhotoCategory === '__NEW__') setActiveTab(targetCategory);

    } catch (error) {
      console.error('Failed to upload photos', error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'There was an error processing or saving the photos.' });
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    try {
        await deletePhoto(photo);
        toast({ title: "Success", description: "Photo deleted from the library." });
        fetchPhotos();
        triggerViewRefresh();
    } catch (error) {
        console.error("Failed to delete photo", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the photo.' });
    }
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

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
        await updatePhoto(editingPhoto.id, editingPhotoCategory, editingPhoto);
        setIsEditDialogOpen(false);
        setEditingPhoto(null);
        toast({ title: "Success", description: "Photo details have been updated." });
        fetchPhotos();
        triggerViewRefresh();
    } catch(error) {
        console.error("Failed to update photo", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update photo details.' });
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) setEditingPhoto(null);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryInput.trim();
    if (trimmedName && !photoGroups.hasOwnProperty(trimmedName)) {
      setPhotoGroups((prev) => ({ ...prev, [trimmedName]: [] }));
      setActiveTab(trimmedName);
      setNewCategoryInput('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty or already exist.' });
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (Object.keys(photoGroups).length <= 1) {
      toast({ variant: 'destructive', title: 'Cannot Delete', description: 'You must have at least one category.' });
      return;
    }
    
    try {
      await deletePhotoCategory(categoryName);
      toast({ title: "Category Deleted", description: `The "${categoryName}" category has been removed.` });
      fetchPhotos();
      triggerViewRefresh();
    } catch (error) {
      console.error("Failed to delete category", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the category.' });
    }
  };

  const handleStartRename = (name: string) => {
    setRenamingCategory({ oldName: name, newName: name });
  };

  const handleRenameCategory = async () => {
    if (!renamingCategory) return;
    const { oldName, newName } = renamingCategory;
    const trimmedNewName = newName.trim();

    if (!trimmedNewName || (trimmedNewName !== oldName && photoGroups.hasOwnProperty(trimmedNewName))) {
      toast({ variant: 'destructive', title: 'Error', description: 'Category name cannot be empty or already exist.' });
      return;
    }

    if (trimmedNewName === oldName) {
      setRenamingCategory(null);
      return;
    }
    
    try {
      await renamePhotoCategory(oldName, trimmedNewName);
      setRenamingCategory(null);
      toast({ title: "Category Renamed", description: `"${oldName}" is now "${trimmedNewName}".` });
      fetchPhotos();
      triggerViewRefresh();
      setActiveTab(trimmedNewName);
    } catch (error) {
      console.error("Failed to rename category", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not rename the category.' });
    }
  };

  const handleRemoveDuplicates = async () => {
    try {
      const res = await fetch('/api/photos/remove-duplicates', { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      toast({ title: 'Duplicates Removed', description: `${data.removed} duplicate(s) deleted.` });
      fetchPhotos();
      triggerViewRefresh();
    } catch (error) {
      console.error('Failed to remove duplicates', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not remove duplicate photos.' });
    }
  };

  const toggleSelectPhoto = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await deletePhotos(ids);
      toast({ title: 'Photos Deleted', description: `${ids.length} photo(s) removed.` });
      setSelectedIds(new Set());
      setSelectionMode(false);
      fetchPhotos();
      triggerViewRefresh();
    } catch (error) {
      console.error('Failed to delete selected photos', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete selected photos.' });
    }
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
              <p>Loading photo library from database...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Photo Management</h1>
        <div className="flex items-center gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Settings className="mr-2 h-4 w-4" />Manage Categories</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Manage Photo Categories</DialogTitle><DialogDescription>Add, rename, or delete your photo categories here.</DialogDescription></DialogHeader>
              <form onSubmit={handleAddCategory} className="py-4">
                <Label htmlFor="new-category-name" className="text-sm font-medium">Add New Category</Label>
                <div className="flex space-x-2 mt-2">
                  <Input id="new-category-name" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="e.g., Holidays" />
                  <Button type="submit">Add</Button>
                </div>
              </form>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Existing Categories</h4>
                <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                  {Object.keys(photoGroups).map((category) => (
                    <div key={category} className="flex items-center justify-between rounded-md border p-2">
                      {renamingCategory?.oldName === category ? (
                        <div className="flex w-full items-center gap-2">
                          <Input value={renamingCategory.newName} onChange={(e) => setRenamingCategory({ ...renamingCategory, newName: e.target.value })} className="h-8" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRenameCategory(); } }}/>
                          <Button size="sm" onClick={handleRenameCategory}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setRenamingCategory(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm">{category}</span>
                          <div className="flex items-center">
                            <Button variant="ghost" size="sm" onClick={() => handleStartRename(category)}>Rename</Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={Object.keys(photoGroups).length <= 1}>Delete</Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the "{category}" category and all photos within it from the database.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={() => handleDeleteCategory(category)}>Delete</AlertDialogAction>
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
              <DialogFooter><Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Close</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => {
              setIsUploadDialogOpen(isOpen);
              if (isOpen) {
                const initialCategory = activeTab || Object.keys(photoGroups)[0] || '';
                setNewPhotoCategory(initialCategory);
                setNewCategoryName('');
                setNewPhotoFiles(null);
                const fileInput = document.getElementById('photo-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
              }
            }}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Photos</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleUploadPhoto}>
                <DialogHeader><DialogTitle>Add Photos</DialogTitle><DialogDescription>Select one or more photos from your device, choose a category, and upload.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2"><Label htmlFor="photo-file">Photo File(s)</Label><Input id="photo-file" type="file" accept="image/*" onChange={handleFileChange} required multiple/></div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newPhotoCategory} onValueChange={setNewPhotoCategory} required>
                      <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(photoGroups).map((cat) => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}
                        <Separator />
                        <SelectItem value="__NEW__">-- Create new category --</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   {newPhotoCategory === '__NEW__' && (<div className="space-y-2"><Label htmlFor="new-category-name-upload">New Category Name</Label><Input id="new-category-name-upload" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Vacation 2024" required/></div>)}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Photos</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleRemoveDuplicates}>Remove Duplicates</Button>
          {!selectionMode && (
            <Button variant="outline" onClick={() => setSelectionMode(true)}>Select Photos</Button>
          )}
          {selectionMode && (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
              >
                Delete Selected
              </Button>
              <Button variant="outline" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdatePhoto}>
            <DialogHeader><DialogTitle>Edit Photo</DialogTitle><DialogDescription>Update the photo details.</DialogDescription></DialogHeader>
            {editingPhoto && (
              <div className="grid gap-4 py-4">
                <div className="relative aspect-video w-full"><Image src={editingPhoto.src} alt={editingPhoto.alt} layout="fill" objectFit="contain" className="rounded-md"/></div>
                <div className="space-y-2"><Label htmlFor="edit-alt-text">Description (Alt Text)</Label><Input id="edit-alt-text" value={editingPhoto.alt} onChange={(e) => setEditingPhoto({ ...editingPhoto, alt: e.target.value })} required/></div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editingPhotoCategory} onValueChange={setEditingPhotoCategory}>
                    <SelectTrigger id="edit-category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(photoGroups).map((cat) => (<SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter><Button type="button" variant="outline" onClick={() => handleEditDialogChange(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader><CardTitle>Photo Library</CardTitle><CardDescription>Upload, organize, and manage the photos displayed on the board.</CardDescription></CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              {Object.keys(photoGroups).map((category) => (<TabsTrigger key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</TabsTrigger>))}
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
                        selectionMode={selectionMode}
                        checked={selectedIds.has(p.id)}
                        onCheckedChange={(checked) => toggleSelectPhoto(p.id, checked as boolean)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <p>This category is empty.</p>
                    <p className="text-sm">Use the "Add Photos" button to upload photos to this category.</p>
                  </div>
                )}
              </TabsContent>
            ))}
             {Object.keys(photoGroups).length === 0 && (
                 <div className="py-12 text-center text-muted-foreground">
                    <p>Your photo library is empty.</p>
                    <p className="text-sm">Use the "Add Photos" button to upload your first photo.</p>
                  </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

type PhotoCardProps = {
  photo: Photo;
  onDelete: (photo: Photo) => void;
  onEdit: (photo: Photo) => void;
  selectionMode: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function PhotoCard({ photo, onDelete, onEdit, selectionMode, checked, onCheckedChange }: PhotoCardProps) {
  const { id, src, alt, 'data-ai-hint': dataAiHint } = photo;
  return (
    <Card className="overflow-hidden relative">
      {selectionMode && (
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(Boolean(v))}
          className="absolute left-2 top-2 z-10 bg-background"
        />
      )}
      <div className="relative aspect-[4/3]">
        <Image src={src} alt={alt} layout="fill" objectFit="cover" data-ai-hint={dataAiHint} />
      </div>
      <CardContent className="p-2 flex items-start justify-between gap-2">
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate" title={alt}>{alt}</p>
          <p className="text-xs text-muted-foreground truncate" title={id}>ID: {id}</p>
        </div>
        {!selectionMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(photo)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this photo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(photo)} className={buttonVariants({ variant: 'destructive' })}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardContent>
    </Card>
  );
}
