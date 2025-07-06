'use client';

import type { Message } from './data';

const jsonHeaders = { 'Content-Type': 'application/json' };

export const getMessages = async (): Promise<Message[]> => {
  const res = await fetch('/api/messages');
  if (!res.ok) {
    throw new Error('Failed to load messages');
  }
  return res.json();
};

export const addMessage = async (message: Omit<Message, 'id'>): Promise<string> => {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(message),
  });
  if (!res.ok) {
    throw new Error('Failed to add message');
  }
  const data = await res.json();
  return data.id as string;
};

export const updateMessage = async (id: string, message: Partial<Message>): Promise<void> => {
  await fetch(`/api/messages/${id}` , {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(message),
  });
};

export const deleteMessage = async (id: string): Promise<void> => {
  await fetch(`/api/messages/${id}`, { method: 'DELETE' });
};

export const getMessageCount = async (): Promise<number> => {
  const res = await fetch('/api/messages/count');
  if (!res.ok) {
    throw new Error('Failed to load message count');
  }
  const data = await res.json();
  return data.count as number;
};
