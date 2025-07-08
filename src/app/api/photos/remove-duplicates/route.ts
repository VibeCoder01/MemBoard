import { NextResponse } from "next/server";
import { all, run } from "@/lib/sqlite";

export async function POST() {
  const rows = await all<{ id: string; storage_path: string }>(
    "SELECT id, storage_path FROM photos ORDER BY createdAt ASC",
  );
  const seen = new Set<string>();
  const idsToDelete: string[] = [];

  for (const row of rows) {
    if (row.storage_path && seen.has(row.storage_path)) {
      idsToDelete.push(row.id);
    } else if (row.storage_path) {
      seen.add(row.storage_path);
    }
  }

  for (const id of idsToDelete) {
    await run("DELETE FROM photos WHERE id = ?", [id]);
  }

  return NextResponse.json({ removed: idsToDelete.length });
}
