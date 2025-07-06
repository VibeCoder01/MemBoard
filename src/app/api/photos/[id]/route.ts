import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/sqlite';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { group, data } = await request.json();
  const fields = data ? Object.keys(data) : [];
  const setParts = fields.map((f) => `${f} = ?`);
  const values = fields.map((f) => data[f]);
  setParts.push('group_name = ?');
  values.push(group);
  await run(`UPDATE photos SET ${setParts.join(', ')} WHERE id = ?`, [...values, params.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await run('DELETE FROM photos WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
