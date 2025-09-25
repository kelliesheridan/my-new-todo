// types/db.ts
export type Task = {
  id: string;
  user_id: string;
  title: string;
  is_done: boolean;
  created_at: string; // ISO timestamp
};