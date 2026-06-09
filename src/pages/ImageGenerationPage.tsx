import { useState } from 'react';
import { Image, RefreshCw, Copy, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const MODELS = [
  { id: 'dall-e', name: 'DALL-E 3', provider: 'OpenAI' },
  { id: 'flux', name: 'Flux Pro', provider: 'Black Forest Labs' },
  { id: 'stable-diffusion', name: 'Stable Diffusion XL', provider: 'Stability AI' },
  { id: 'gemini-image', name: 'Gemini Image', provider: 'Google' },
];

const SIZES = ['1024x1024', '1024x1792', '1792x1024'];

const STYLES = ['Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Anime', '3D Render', 'Pixel Art', 'Sketch'];

export function ImageGenerationPage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('dall-e');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('Photorealistic');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ url: string; prompt: string; model: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-gen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ prompt: `${prompt}, ${style} style`, model, size }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setGeneratedUrl(data.url);
      setHistory(prev => [{ url: data.url, prompt, model }, ...prev.slice(0, 11)]);
    } catch {
      setGeneratedUrl(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Controls */}
      <div className="w-80 border-r border-surface-800 flex flex-col bg-surface-900 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2 mb-4">
          <Image size={20} className="text-primary-400" /> Image Generation
        </h2>

        <div className="mb-5">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Model</label>
          <div className="space-y-1">
            {MODELS.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)}
                className={clsx('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                  model === m.id ? 'bg-primary-600/15 text-primary-400' : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                )}>
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-surface-500">{m.provider}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Size</label>
          <div className="flex gap-1">
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={clsx('flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  size === s ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                )}>
                {s.replace('x', 'x')}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Style</label>
          <div className="flex flex-wrap gap-1">
            {STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  style === s ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-24" />
        </div>

        <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>

        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">History</h3>
            <div className="grid grid-cols-2 gap-2">
              {history.map((h, i) => (
                <div key={i} onClick={() => setGeneratedUrl(h.url)} className="cursor-pointer rounded-lg overflow-hidden border border-surface-800 hover:border-surface-700 transition-colors">
                  <img src={h.url} alt={h.prompt} className="w-full h-20 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-6">
        {generatedUrl ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
              <img src={generatedUrl} alt="Generated" className="w-full max-h-[60vh] object-contain bg-surface-950" />
              <div className="p-4">
                <p className="text-sm text-surface-300 mb-3">{prompt}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-800 text-primary-400">{MODELS.find(m => m.id === model)?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-800 text-surface-500">{size}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-800 text-surface-500">{style}</span>
                  <div className="flex-1" />
                  <button onClick={() => navigator.clipboard.writeText(prompt)} className="flex items-center gap-1 px-2.5 py-1 bg-surface-800 text-surface-400 hover:text-surface-200 rounded-lg text-xs transition-colors">
                    <Copy size={12} /> Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                <Image size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-surface-300 mb-1">Image Generation</h3>
              <p className="text-sm text-surface-500 max-w-sm">Create stunning images with AI. Describe what you envision and choose your preferred model and style.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
