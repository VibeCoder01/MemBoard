import { NextRequest, NextResponse } from 'next/server';
import { run, all, get } from '@/lib/sqlite';
import type { Photo } from '@/lib/data';

interface StoredPhoto extends Photo { group: string }

export async function GET() {
  const rows = await all<StoredPhoto>('SELECT * FROM photos');
  const groups: Record<string, Photo[]> = {};
  rows.forEach((row) => {
    const photo: Photo = {
      id: row.id,
      src: row.src,
      alt: row.alt,
      'data-ai-hint': row.data_ai_hint,
      storagePath: row.storage_path,
    };
    const group = row.group_name || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(photo);
  });
  return NextResponse.json(groups);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const group = String(formData.get('group') || 'default');
  const files = formData.getAll('files') as File[];
  const inserted: Photo[] = [];
  const duplicates: string[] = [];

  for (const file of files) {
    const existing = await get<{ id: string }>('SELECT id FROM photos WHERE storage_path = ?', [file.name]);
    if (existing) {
      duplicates.push(file.name);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomUUID();
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
    const hint = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[-_]/g, ' ');
    await run(
      'INSERT INTO photos (id, src, alt, data_ai_hint, storage_path, group_name, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, base64, hint, hint.split(' ').slice(0,2).join(' '), file.name, group, Date.now()]
    );
    inserted.push({ id, src: base64, alt: hint, 'data-ai-hint': hint.split(' ').slice(0,2).join(' '), storagePath: file.name });
  }

  return NextResponse.json({ inserted, duplicates }, { status: 201 });
}
