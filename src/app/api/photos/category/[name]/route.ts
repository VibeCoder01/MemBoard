import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/sqlite';

export async function DELETE(request: NextRequest, { params }: { params: { name: string } }) {
  await run('DELETE FROM photos WHERE group_name = ?', [params.name]);
  return NextResponse.json({ ok: true });
}
