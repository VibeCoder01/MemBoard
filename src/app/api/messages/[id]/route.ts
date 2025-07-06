import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/sqlite';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const data = await request.json();
  const fields = Object.keys(data);
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => data[f]);
  await run(`UPDATE messages SET ${setClause} WHERE id = ?`, [...values, params.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await run('DELETE FROM messages WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
