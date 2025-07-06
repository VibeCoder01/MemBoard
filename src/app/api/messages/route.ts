import { NextRequest, NextResponse } from 'next/server';
import { run, all } from '@/lib/sqlite';
import type { Message } from '@/lib/data';

export async function GET() {
  const rows = await all<Message>('SELECT id, content, schedule, status FROM messages ORDER BY createdAt DESC');
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as Omit<Message, 'id'>;
  const id = crypto.randomUUID();
  await run(
    'INSERT INTO messages (id, content, schedule, status, createdAt) VALUES (?, ?, ?, ?, ?)',
    [id, data.content, data.schedule, data.status, Date.now()]
  );
  return NextResponse.json({ id }, { status: 201 });
}
