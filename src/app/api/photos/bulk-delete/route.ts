import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/sqlite';

export async function POST(request: NextRequest) {
  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const placeholders = ids.map(() => '?').join(', ');
  await run(`DELETE FROM photos WHERE id IN (${placeholders})`, ids);
  return NextResponse.json({ deleted: ids.length });
}
