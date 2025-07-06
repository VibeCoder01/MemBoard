import { NextResponse } from 'next/server';
import { get } from '@/lib/sqlite';

export async function GET() {
  const row = await get<{ count: number }>('SELECT COUNT(*) as count FROM messages');
  return NextResponse.json({ count: row?.count || 0 });
}
