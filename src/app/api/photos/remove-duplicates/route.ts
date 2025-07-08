import { NextResponse } from "next/server";
import { all, run } from "@/lib/sqlite";
import crypto from 'crypto';

export async function POST() {
  const rows = await all<{ id: string; hash: string | null; src: string }>(
    "SELECT id, hash, src FROM photos ORDER BY createdAt ASC",
  );
  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const row of rows) {
    let h = row.hash;
    if (!h) {
      const base64 = row.src.split(',')[1] || '';
      const buffer = Buffer.from(base64, 'base64');
      h = crypto.createHash('sha256').update(buffer).digest('hex');
      await run('UPDATE photos SET hash = ? WHERE id = ?', [h, row.id]);
    }
    if (seen.has(h)) {
      idsToDelete.push(row.id);
    } else {
      seen.add(h);
    }
  }

  for (const id of idsToDelete) {
    await run("DELETE FROM photos WHERE id = ?", [id]);
  }

  return NextResponse.json({ removed: idsToDelete.length });
}
