'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CanvasWorkspace() {
  const [topic, setTopic] = useState('');
  const [canvas, setCanvas] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCanvas = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setCanvas('');

    try {
      const res = await fetch('/api/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic.trim() }),
      });
      const data = await res.json();
      setCanvas(data.output ?? 'No workspace generated.');
    } catch (error) {
      console.error(error);
      setCanvas('Unable to generate workspace content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Canvas</CardTitle>
        <CardDescription>Create notes, plans, and insights in a split-screen workspace.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Describe what the workspace should generate" />
        <Button onClick={generateCanvas} disabled={loading || !topic.trim()}>
          {loading ? 'Generating...' : 'Generate Canvas'}
        </Button>
        {canvas ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
            <pre className="whitespace-pre-wrap">{canvas}</pre>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
