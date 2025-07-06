import sqlite3 from 'sqlite3';

sqlite3.verbose();

let db: sqlite3.Database | null = null;

function getDatabase(): Promise<sqlite3.Database> {
  if (db) return Promise.resolve(db);

  const filename = process.env.SQLITE_PATH || './memboard.sqlite';

  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(filename, (err) => {
      if (err) return reject(err);
      database.serialize(() => {
        database.run(`CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          schedule TEXT,
          status TEXT NOT NULL,
          createdAt INTEGER
        );`);
        database.run(`CREATE TABLE IF NOT EXISTS photos (
          id TEXT PRIMARY KEY,
          src TEXT NOT NULL,
          alt TEXT NOT NULL,
          data_ai_hint TEXT,
          storage_path TEXT,
          group_name TEXT,
          createdAt INTEGER
        );`);
        database.run(`CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          data TEXT NOT NULL
        );`);
      });
      db = database;
      resolve(database);
    });
  });
}

export async function run(sql: string, params: any[] = []): Promise<void> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    database.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export async function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}
