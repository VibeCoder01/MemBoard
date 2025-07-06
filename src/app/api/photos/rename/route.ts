import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/sqlite';

export async function POST(request: NextRequest) {
  const { oldName, newName } = await request.json();
  await run('UPDATE photos SET group_name = ? WHERE group_name = ?', [newName, oldName]);
  return NextResponse.json({ ok: true });
}
