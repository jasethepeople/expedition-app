'use client';

import { useEffect, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { JournalEntry, JournalEntryInsert } from '@/types/database';

interface JournalLogProps {
  waypointId: string;
  accent: 'gold' | 'polar';
}

export default function JournalLog({ waypointId, accent }: JournalLogProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  useEffect(() => {
    setEntries([]);
    setReady(false);
    if (!hasSupabase) {
      setReady(true);
      return;
    }
    supabase
      .from('journal_entries')
      .select('*')
      .eq('waypoint_id', waypointId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data as JournalEntry[]);
        setReady(true);
      });
  }, [waypointId, hasSupabase]);

  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const notes = draft.trim();
    if (!notes) return;
    if (notes.length > 2000) {
      setError('Notes are limited to 2000 characters.');
      return;
    }
    setError(null);
    setLoading(true);

    const optimistic: JournalEntry = {
      id: crypto.randomUUID(),
      waypoint_id: waypointId,
      author: null,
      notes,
      media_urls: [],
      created_at: new Date().toISOString(),
    };

    if (hasSupabase) {
      const payload: JournalEntryInsert = { waypoint_id: waypointId, notes };
      const { error: insertError } = await supabase.from('journal_entries').insert(payload);
      if (insertError) {
        // Covers the rate-limit trigger and the length/media check constraints
        // from supabase/migrations/002_hardening.sql — surface it instead
        // of silently dropping the entry.
        setError(
          insertError.message.includes('Rate limit')
            ? 'Too many entries for this waypoint in the last minute — try again shortly.'
            : insertError.message
        );
        setLoading(false);
        return;
      }
    }

    setEntries((prev) => [optimistic, ...prev]);
    setDraft('');
    setLoading(false);
  };

  const accentText = accent === 'gold' ? 'text-gold' : 'text-polar';
  const accentBorder = accent === 'gold' ? 'focus:border-gold' : 'focus:border-polar';
  const accentBg = accent === 'gold' ? 'bg-gold text-void' : 'bg-polar text-void';

  return (
    <div>
      <h3 className={`mb-2 font-mono text-[10px] uppercase tracking-widest text-muted`}>Expedition Journal</h3>

      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Log a note, thought, or research finding for this waypoint…"
          rows={2}
          className={`flex-1 resize-none rounded-md border border-hairline bg-void px-3 py-2 text-sm text-parchment outline-none placeholder:text-muted ${accentBorder}`}
        />
        <button
          onClick={submit}
          disabled={loading || !draft.trim()}
          className={`flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-md ${accentBg} disabled:opacity-40`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
      {!hasSupabase && (
        <p className="mt-1.5 text-[11px] text-muted">Demo mode — entries are local to this session only.</p>
      )}
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}

      <ul className="mt-4 space-y-3">
        {!ready && <li className="text-xs text-muted">Loading entries…</li>}
        {ready && entries.length === 0 && <li className="text-xs text-muted">No entries yet.</li>}
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-md border border-hairline bg-void/60 p-3">
            <p className="text-sm text-parchment/90">{entry.notes}</p>
            <span className={`mt-1 block font-mono text-[10px] ${accentText}`}>
              {new Date(entry.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
