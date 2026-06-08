'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AgentPanel() {
  const [task, setTask] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const executeAgent = async () => {
    if (!task.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: task.trim() }),
      });
      const data = await res.json();
      setResponse(data.output ?? 'No result returned.');
    } catch (error) {
      console.error(error);
      setResponse('Unable to run the agent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent</CardTitle>
        <CardDescription>Break tasks into steps and reason through multi-step workflows.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <Input value={task} onChange={(event) => setTask(event.target.value)} placeholder="Plan a launch sequence, make a study plan, or debug a process" />
        <Button onClick={executeAgent} disabled={loading || !task.trim()}>
          {loading ? 'Thinking...' : 'Run Agent'}
        </Button>
        {response ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
