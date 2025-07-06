
'use client';

import { db, storage } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type { Photo, PhotoGroups } from '@/lib/data';

// Type for Firestore document
type StoredPhoto = Omit<Photo, 'id'> & {
    group: string;
};

const checkFirebase = () => {
    if (!db || !storage) {
        throw new Error("Firebase is not initialized. Check your Firebase configuration in .env.local.");
    }
}

export const getPhotoGroups = async (): Promise<PhotoGroups> => {
    checkFirebase();
    const photosCollection = collection(db!, 'photos');
    const snapshot = await getDocs(photosCollection);
    const groups: PhotoGroups = {};
    snapshot.docs.forEach(doc => {
        const data = doc.data() as StoredPhoto;
        // The document ID from firestore is the photo's ID
        const photo: Photo = { id: doc.id, ...data };
        if (!groups[data.group]) {
            groups[data.group] = [];
        }
        groups[data.group].push(photo);
    });
    return groups;
};

export const getPhotoCount = async (): Promise<number> => {
    checkFirebase();
    const photosCollection = collection(db!, 'photos');
    const snapshot = await getDocs(photosCollection);
    return snapshot.size;
};

export const addPhotos = async (files: File[], group: string): Promise<Photo[]> => {
    checkFirebase();
    const photosCollection = collection(db!, 'photos');
    const newPhotos: Photo[] = [];
    for (const file of files) {
        const uniqueId = crypto.randomUUID();
        const storagePath = `photos/${uniqueId}-${file.name}`;
        const storageRef = ref(storage!, storagePath);

        // Upload file to Firebase Storage
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        const altText = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[-_]/g, ' ');

        const photoData: Omit<StoredPhoto, 'id'> = {
            src: downloadURL,
            alt: altText,
            'data-ai-hint': altText.toLowerCase().split(' ').slice(0, 2).join(' '),
            storagePath: storagePath,
            group: group,
        };

        // Add photo metadata to Firestore
        const docRef = await addDoc(photosCollection, photoData);
        newPhotos.push({ id: docRef.id, ...photoData });
    }
    return newPhotos;
};

export const deletePhoto = async (photo: Photo): Promise<void> => {
    checkFirebase();
    // Delete file from Storage
    const storageRef = ref(storage!, photo.storagePath);
    await deleteObject(storageRef);

    // Delete doc from Firestore
    const photoDoc = doc(db!, 'photos', photo.id);
    await deleteDoc(photoDoc);
};

export const updatePhoto = async (id: string, newGroup: string, photoData: Partial<Photo>): Promise<void> => {
    checkFirebase();
    const photoDoc = doc(db!, 'photos', id);
    const { id: _, ...updateData } = photoData;
    await updateDoc(photoDoc, { ...updateData, group: newGroup });
};

export const renamePhotoCategory = async (oldName: string, newName:string): Promise<void> => {
    checkFirebase();
    const photosCollection = collection(db!, 'photos');
    const q = query(photosCollection, where('group', '==', oldName));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db!);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { group: newName });
    });
    await batch.commit();
};

export const deletePhotoCategory = async (categoryName: string): Promise<void> => {
    checkFirebase();
    const photosCollection = collection(db!, 'photos');
    const q = query(photosCollection, where('group', '==', categoryName));
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db!);
    const deletePromises: Promise<void>[] = [];

    snapshot.docs.forEach(doc => {
        const photo = doc.data() as StoredPhoto;
        // Delete file from storage
        if (photo.storagePath) {
            const storageRef = ref(storage!, photo.storagePath);
            deletePromises.push(deleteObject(storageRef));
        }
        // Delete doc from firestore
        batch.delete(doc.ref);
    });

    await Promise.all(deletePromises);
    await batch.commit();
};
