'use client';

import type { Photo, PhotoGroups } from '@/lib/data';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const getPhotoGroups = async (): Promise<PhotoGroups> => {
  const res = await fetch('/api/photos');
  if (!res.ok) {
    console.error('Failed to load photos');
    return {};
  }
  return res.json();
};

export const getPhotoCount = async (): Promise<number> => {
  const res = await fetch('/api/photos/count');
  if (!res.ok) {
    throw new Error('Failed to load photo count');
  }
  const data = await res.json();
  return data.count as number;
};

export type AddPhotosResponse = {
  inserted: Photo[];
  duplicates: string[];
};

export const addPhotos = async (files: File[], group: string): Promise<AddPhotosResponse> => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  formData.append('group', group);
  const res = await fetch('/api/photos', { method: 'POST', body: formData });
  if (!res.ok) {
    throw new Error('Failed to upload photos');
  }
  return res.json();
};

export const deletePhoto = async (photo: Photo): Promise<void> => {
  await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' });
};

export const deletePhotos = async (ids: string[]): Promise<void> => {
  await fetch('/api/photos/bulk-delete', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ ids }),
  });
};

export const updatePhoto = async (id: string, newGroup: string, photoData: Partial<Photo>): Promise<void> => {
  const res = await fetch(`/api/photos/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ group: newGroup, data: photoData }),
  });
  if (!res.ok) {
    throw new Error('Failed to update photo');
  }
};

export const renamePhotoCategory = async (oldName: string, newName: string): Promise<void> => {
  await fetch('/api/photos/rename', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ oldName, newName }),
  });
};

export const deletePhotoCategory = async (categoryName: string): Promise<void> => {
  await fetch(`/api/photos/category/${encodeURIComponent(categoryName)}`, { method: 'DELETE' });
};
