'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PromptEnhancerProps {
  onEnhance: (value: string) => void;
}

export function PromptEnhancer({ onEnhance }: PromptEnhancerProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/prompt-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        onEnhance(data.enhancedPrompt);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="space-y-3 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-300">Improve a prompt for better AI results.</p>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Paste your prompt to enhance" />
        <Button onClick={handleEnhance} disabled={loading || !prompt.trim()}>Enhance</Button>
      </div>
    </Card>
  );
}
