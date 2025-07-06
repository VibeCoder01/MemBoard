import { NextRequest, NextResponse } from 'next/server';
import { get, run } from '@/lib/sqlite';
import { defaultSettings } from '@/lib/data';

export async function GET() {
  const row = await get<{ data: string }>('SELECT data FROM settings WHERE id = 1');
  if (!row) {
    await run('INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)', [JSON.stringify(defaultSettings)]);
    return NextResponse.json(defaultSettings);
  }
  return NextResponse.json(JSON.parse(row.data));
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  await run('INSERT OR REPLACE INTO settings (id, data) VALUES (1, ?)', [JSON.stringify(data)]);
  return NextResponse.json({ ok: true });
}
