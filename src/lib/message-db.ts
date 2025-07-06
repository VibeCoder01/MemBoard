
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

const messagesCollection = collection(db, 'messages');

export const getMessages = async (): Promise<Message[]> => {
    const q = query(messagesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as Message));
};

export const addMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
    const docRef = await addDoc(messagesCollection, {
        ...message,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateMessage = async (id: string, message: Partial<Message>): Promise<void> => {
    const messageDoc = doc(db, 'messages', id);
    // remove id from the object to avoid writing it to the document
    const { id: _, ...updateData } = message;
    await updateDoc(messageDoc, updateData);
};

export const deleteMessage = async (id: string): Promise<void> => {
    const messageDoc = doc(db, 'messages', id);
    await deleteDoc(messageDoc);
};

export const getMessageCount = async (): Promise<number> => {
    const snapshot = await getDocs(messagesCollection);
    return snapshot.size;
}
