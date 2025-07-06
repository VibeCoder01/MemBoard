export interface Database {}

export async function open(options: any): Promise<Database> {
  throw new Error('SQLite support has been removed from this project.');
}
