
'use client';

import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Message } from './data';

const checkDb = () => {
    if (!db) {
        throw new Error("Firestore is not initialized. Check your Firebase configuration in .env.local.");
    }
}

export const getMessages = async (): Promise<Message[]> => {
    checkDb();
    const messagesCollection = collection(db!, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as Message));
};

export const addMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
    checkDb();
    const messagesCollection = collection(db!, 'messages');
    const docRef = await addDoc(messagesCollection, {
        ...message,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateMessage = async (id: string, message: Partial<Message>): Promise<void> => {
    checkDb();
    const messageDoc = doc(db!, 'messages', id);
    // remove id from the object to avoid writing it to the document
    const { id: _, ...updateData } = message;
    await updateDoc(messageDoc, updateData);
};

export const deleteMessage = async (id: string): Promise<void> => {
    checkDb();
    const messageDoc = doc(db!, 'messages', id);
    await deleteDoc(messageDoc);
};

export const getMessageCount = async (): Promise<number> => {
    checkDb();
    const messagesCollection = collection(db!, 'messages');
    const snapshot = await getDocs(messagesCollection);
    return snapshot.size;
}
