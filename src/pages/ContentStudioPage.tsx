import { useState } from 'react';
import { PenTool, Sparkles, Copy, RefreshCw, FileText, Mail, MessageSquare, Megaphone, ClipboardList } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CONTENT_TYPES = [
  { id: 'blog', label: 'Blog Post', icon: FileText, description: 'Long-form articles and posts' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Professional emails and outreach' },
  { id: 'social', label: 'Social Post', icon: MessageSquare, description: 'Twitter, LinkedIn, etc.' },
  { id: 'marketing', label: 'Marketing Copy', icon: Megaphone, description: 'Ad copy and landing pages' },
  { id: 'report', label: 'Report', icon: ClipboardList, description: 'Business reports and proposals' },
];

const TONES = ['professional', 'casual', 'formal', 'friendly', 'persuasive', 'informative'];

export function ContentStudioPage() {
  const [selectedType, setSelectedType] = useState('blog');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [generated, setGenerated] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ type: selectedType, prompt: prompt.trim(), tone }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const result = await res.json();
      setGenerated(result.content || 'Generation failed. Please try again.');
    } catch {
      setGenerated('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Controls */}
      <div className="w-80 border-r border-surface-800 flex flex-col bg-surface-900 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2 mb-4">
          <PenTool size={20} className="text-primary-400" /> Content Studio
        </h2>

        {/* Type selector */}
        <div className="space-y-1 mb-6">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Content Type</label>
          {CONTENT_TYPES.map(ct => (
            <button key={ct.id} onClick={() => setSelectedType(ct.id)}
              className={clsx('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                selectedType === ct.id ? 'bg-primary-600/15 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              )}>
              <ct.icon size={16} />
              <div>
                <p className="text-sm font-medium">{ct.label}</p>
                <p className="text-xs text-surface-500">{ct.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Tone selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Tone</label>
          <div className="flex flex-wrap gap-1">
            {TONES.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors',
                  tone === t ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Topic / Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe what you want to write about..."
            className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-28" />
        </div>

        <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-6">
        {generated ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-300">Generated Content</h3>
              <button onClick={() => navigator.clipboard.writeText(generated)} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-800 text-surface-400 hover:text-surface-200 rounded-lg text-xs transition-colors">
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{generated}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <PenTool size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-surface-300 mb-1">Content Studio</h3>
              <p className="text-sm text-surface-500">Select a content type and enter a topic to generate professional content</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
