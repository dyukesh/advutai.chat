'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: string | null;
}

export function MemoryPanel() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('personal');
  const [loading, setLoading] = useState(false);

  const filteredItems = items.filter((item) =>
    [item.key, item.value, item.category]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  useEffect(() => {
    fetch('/api/memory')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch(console.error);
  }, []);

  const createMemory = async () => {
    if (!key.trim() || !value.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim(), value: value.trim(), category }),
      });
      if (!response.ok) throw new Error('Failed to save memory');
      const saved = await response.json();
      setItems((prev) => [saved, ...prev]);
      setKey('');
      setValue('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Brain</CardTitle>
        <CardDescription>Save personal facts, preferences, and important context for future AI recall.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="memory-search">Search memory</Label>
            <Input id="memory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your second brain" />
          </div>
          <div>
            <Label htmlFor="memory-category">Category</Label>
            <Input id="memory-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
          </div>
        </div>
        <div>
          <Label htmlFor="memory-value">Memory details</Label>
          <textarea
            id="memory-value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-2 min-h-[120px] w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Add a short summary that AI should remember."
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-400">Use this memory for personalization and context recall.</p>
          <Button onClick={createMemory} disabled={loading}>Save memory</Button>
        </div>
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-slate-400">Save quick facts, reminders, or follow-up items that AdvutAI can recall.</p>
          ) : (
            filteredItems.map((memory) => (
              <div key={memory.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{memory.key}</p>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{memory.category || 'general'}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{memory.value}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
