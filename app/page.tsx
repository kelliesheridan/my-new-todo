'use client';

import { supabase } from '@/lib/supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!userId) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="w-full max-w-sm">
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]}
                view="sign_in" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My To-Do</h1>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </button>
      </div>
      <Tasks />
    </main>
  );
}

/* ----- ultra-minimal tasks component ----- */
function Tasks() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  async function load() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!title.trim()) return;
    await supabase.from('tasks').insert({ title });
    setTitle('');
    load();
  }
  async function toggle(id: string, is_done: boolean) {
    await supabase.from('tasks').update({ is_done: !is_done }).eq('id', id);
    load();
  }

  return (
    <div className="max-w-md">
      <div className="flex gap-2 mb-4">
        <input className="border rounded px-2 py-1 flex-1"
               value={title} onChange={e => setTitle(e.target.value)} placeholder="New task..." />
        <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={add}>Add</button>
      </div>
      <ul className="space-y-2">
        {items.map(t => (
          <li key={t.id} className="flex items-center gap-2">
            <input type="checkbox" checked={t.is_done} onChange={() => toggle(t.id, t.is_done)} />
            <span className={t.is_done ? 'line-through text-gray-500' : ''}>{t.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}