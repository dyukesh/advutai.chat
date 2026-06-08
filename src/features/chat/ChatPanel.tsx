'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PromptEnhancer } from '@/features/chat/PromptEnhancer';
import { cn } from '@/utils/cn';
import { ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseText, setResponseText] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const latestConversation = useMemo(() => [...messages, responseText ? { role: 'assistant', content: responseText } : null].filter(Boolean) as Message[], [messages, responseText]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setResponseText('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ prompt: userText, model: 'gpt-4o-mini' }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to chat API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      let assistantText = '';

      while (!done) {
        const result = await reader.read();
        done = result.done ?? true;
        const chunk = result.value ? decoder.decode(result.value, { stream: true }) : '';
        buffer += chunk;
        const segments = buffer.split('\n');
        buffer = segments.pop() ?? '';

        for (const segment of segments) {
          const trimmed = segment.trim();
          if (!trimmed) continue;
          if (trimmed === 'data: [DONE]') {
            done = true;
            break;
          }
          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.replace(/^data: /, '');
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                assistantText += delta;
                setResponseText(assistantText);
              }
            } catch (error) {
              console.error('Failed to parse stream payload', error);
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Chat</CardTitle>
        <CardDescription>Chat with a model optimized for reasoning, coding, and productivity.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <PromptEnhancer onEnhance={setInput} />
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          {latestConversation.length === 0 ? (
            <p className="text-sm text-slate-400">Ask AdvutAI anything about planning, code, or personal workflow.</p>
          ) : (
            <div className="space-y-4">
              {latestConversation.map((message, index) => (
                <div key={index} className={cn('rounded-3xl p-4', message.role === 'user' ? 'bg-slate-900 text-slate-100' : 'bg-slate-950/80 text-slate-200')}>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-400">{message.role}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Start a new chat prompt..." />
          <Button onClick={handleSend} disabled={loading}>Send</Button>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <span>{loading ? 'Streaming response...' : 'Ready for your next idea.'}</span>
          <Button onClick={handleStop} variant="ghost" size="sm" disabled={!loading}>
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            Stop
          </Button>
        </div>
      </div>
    </Card>
  );
}
