import { useState } from 'react';
import { Code as Code2, Play, Copy, RefreshCw, Bug, Lightbulb, GitBranch, FileCode } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP'];

const MODES = [
  { id: 'generate', label: 'Generate', icon: Play, description: 'Generate code from a description' },
  { id: 'fix', label: 'Fix Bugs', icon: Bug, description: 'Find and fix bugs in your code' },
  { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Explain code line by line' },
  { id: 'refactor', label: 'Refactor', icon: RefreshCw, description: 'Improve code quality' },
  { id: 'analyze', label: 'Analyze', icon: GitBranch, description: 'Review and analyze codebase' },
];

export function CodeAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [mode, setMode] = useState('generate');
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const userApiKey = localStorage.getItem('openai_api_key') ?? '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };
      if (userApiKey) headers['X-User-Api-Key'] = userApiKey;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: prompt.trim(), language, mode }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setResult(data.response || 'Failed to generate. Please try again.');
    } catch {
      setResult('Failed to generate code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Controls panel */}
      <div className="w-80 border-r border-surface-800 flex flex-col bg-surface-900 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2 mb-4">
          <Code2 size={20} className="text-primary-400" /> Code Assistant
        </h2>

        <div className="space-y-1 mb-5">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Mode</label>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={clsx('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                mode === m.id ? 'bg-primary-600/15 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              )}>
              <m.icon size={16} />
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-surface-500">{m.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Language</label>
          <div className="grid grid-cols-2 gap-1">
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  language === l ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                )}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder={mode === 'generate' ? 'Describe the code you want to generate...' : 'Paste or describe the code to work with...'}
            className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-32 font-mono" />
        </div>

        <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <FileCode size={16} />}
          {isGenerating ? 'Processing...' : `${MODES.find(m => m.id === mode)?.label} Code`}
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-6">
        {result ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-300">Result</h3>
              <button onClick={() => navigator.clipboard.writeText(result)} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-800 text-surface-400 hover:text-surface-200 rounded-lg text-xs transition-colors">
                <Copy size={12} /> Copy
              </button>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Code2 size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-surface-300 mb-1">Code Assistant</h3>
              <p className="text-sm text-surface-500 max-w-sm">Generate, fix, explain, refactor, and analyze code across 8+ languages</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {LANGUAGES.slice(0, 4).map(l => (
                  <span key={l} className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-primary-400">{l}</span>
                ))}
                <span className="text-xs px-2 py-1 rounded-lg bg-surface-800 text-surface-500">+{LANGUAGES.length - 4} more</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
