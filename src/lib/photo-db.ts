
'use client';

import type { Photo, PhotoGroups } from '@/lib/data';
import { initialPhotoGroups } from './data';

const DB_NAME = 'MemBoardPhotoDB';
const DB_VERSION = 1;
const PHOTO_STORE_NAME = 'photos';

// We store the group name along with the photo data.
interface StoredPhoto extends Photo {
  group: string;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported.'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(new Error('Failed to open IndexedDB.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        const store = db.createObjectStore(PHOTO_STORE_NAME, { keyPath: 'id' });
        store.createIndex('group', 'group', { unique: false });
      }
    };
  });
};

export const getPhotoGroups = async (): Promise<PhotoGroups> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get photos.'));
    request.onsuccess = () => {
      const allPhotos: StoredPhoto[] = request.result;
      const groups: PhotoGroups = {};
      for (const photo of allPhotos) {
        if (!groups[photo.group]) {
          groups[photo.group] = [];
        }
        const { group, ...photoData } = photo;
        groups[photo.group].push(photoData);
      }
      resolve(groups);
    };
  });
};

export const getPhotoCount = async (): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readonly');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to count photos.'));
    });
};

export const addPhotos = async (photos: Photo[], group: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Transaction failed to add photos.'));

    photos.forEach(photo => {
      const storedPhoto: StoredPhoto = { ...photo, group };
      store.add(storedPhoto);
    });
  });
};

export const deletePhoto = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PHOTO_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete photo.'));
  });
};

export const updatePhoto = async (photo: Photo, newGroup: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const storedPhoto: StoredPhoto = { ...photo, group: newGroup };
        const request = store.put(storedPhoto);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to update photo.'));
    });
};

export const renamePhotoCategory = async (oldName: string, newName: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const index = store.index('group');
        const request = index.openCursor(IDBKeyRange.only(oldName));

        request.onerror = () => reject(new Error('Failed to rename category.'));
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                const updatedPhoto = { ...cursor.value, group: newName };
                cursor.update(updatedPhoto);
                cursor.continue();
            }
        };
        transaction.oncomplete = () => resolve();
    });
};

export const deletePhotoCategory = async (categoryName: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        const index = store.index('group');
        const request = index.openCursor(IDBKeyRange.only(categoryName));

        request.onerror = () => reject(new Error('Failed to delete category photos.'));
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };
        transaction.oncomplete = () => resolve();
    });
};

export const migrateFromLocalStorage = async (): Promise<boolean> => {
    const migrationKey = 'photoMigrationV1Complete';
    if (localStorage.getItem(migrationKey)) {
        return false; // No migration needed
    }

    try {
        const savedGroupsJSON = localStorage.getItem('photoGroups');
        const groupsToMigrate = savedGroupsJSON ? JSON.parse(savedGroupsJSON) : initialPhotoGroups;

        if (!groupsToMigrate || Object.keys(groupsToMigrate).length === 0) {
            localStorage.setItem(migrationKey, 'true');
            return false;
        }

        const db = await openDB();
        const transaction = db.transaction(PHOTO_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(PHOTO_STORE_NAME);
        
        for (const category in groupsToMigrate) {
            if (Array.isArray(groupsToMigrate[category])) {
                for (const photo of groupsToMigrate[category]) {
                    if (photo && photo.id && photo.src) {
                        const storedPhoto: StoredPhoto = { ...photo, group: category };
                        store.add(storedPhoto);
                    }
                }
            }
        }
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                localStorage.setItem(migrationKey, 'true');
                localStorage.removeItem('photoGroups'); // Clean up old data
                console.log('Photo migration from localStorage to IndexedDB complete.');
                resolve(true); // Migration was performed
            };
            transaction.onerror = (event) => {
                console.error('Photo migration failed.', event);
                reject(new Error('Migration transaction failed.'));
            };
        });

    } catch (error) {
        console.error("Error during photo migration:", error);
        // Don't set migration key on error, so it can be retried.
        return false;
    }
};
