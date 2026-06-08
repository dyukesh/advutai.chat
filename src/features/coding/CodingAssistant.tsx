'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CodingAssistant() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      setResult(data.output ?? 'No coding response returned.');
    } catch (error) {
      console.error(error);
      setResult('Unable to process coding request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coding Assistant</CardTitle>
        <CardDescription>Explain, debug, or generate code with a developer-focused AI flow.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask the coding assistant to explain or fix code" />
        <Button onClick={handleRequest} disabled={loading || !prompt.trim()}>
          {loading ? 'Analyzing...' : 'Ask Assistant'}
        </Button>
        {result ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
