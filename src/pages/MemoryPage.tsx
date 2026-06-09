import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import type { Memory } from '../types';
import { Brain, Plus, Trash2, Search, Tag } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES: { value: Memory['category']; label: string; color: string }[] = [
  { value: 'preference', label: 'Preferences', color: 'text-primary-400' },
  { value: 'project', label: 'Projects', color: 'text-success-400' },
  { value: 'interest', label: 'Interests', color: 'text-warning-400' },
  { value: 'work', label: 'Work', color: 'text-accent-400' },
  { value: 'prompt', label: 'Prompts', color: 'text-surface-400' },
  { value: 'general', label: 'General', color: 'text-surface-300' },
];

export function MemoryPage() {
  const { memories, loadMemories, createMemory, deleteMemory } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Memory['category']>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Memory['category'] | 'all'>('all');

  useEffect(() => { loadMemories(); }, [loadMemories]);

  const filtered = memories.filter(m => {
    const matchesSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await createMemory({ title: newTitle.trim(), content: newContent.trim(), category: newCategory });
    setNewTitle('');
    setNewContent('');
    setShowNew(false);
  };

  const categoryCount = (cat: Memory['category']) => memories.filter(m => m.category === cat).length;

  return (
    <div className="flex h-full">
      {/* Category sidebar */}
      <div className="w-56 border-r border-surface-800 flex flex-col bg-surface-900 p-3">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2 mb-2">Categories</h3>
        <button onClick={() => setFilterCategory('all')}
          className={clsx('flex items-center justify-between px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-colors',
            filterCategory === 'all' ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
          )}>
          <span>All Memories</span>
          <span className="text-xs text-surface-500">{memories.length}</span>
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setFilterCategory(cat.value)}
            className={clsx('flex items-center justify-between px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-colors',
              filterCategory === cat.value ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            )}>
            <span className={cat.color}>{cat.label}</span>
            <span className="text-xs text-surface-500">{categoryCount(cat.value)}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
            <Brain size={20} className="text-primary-400" /> Memory
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search memories..." className="bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 w-56" />
            </div>
            <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus size={14} /> Add Memory
            </button>
          </div>
        </div>

        {showNew && (
          <div className="px-6 py-4 border-b border-surface-800 bg-surface-900">
            <div className="max-w-xl space-y-3">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Memory title..."
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500" />
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="What should AdvutAI remember?"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-24" />
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setNewCategory(cat.value)}
                      className={clsx('px-2 py-1 rounded text-xs font-medium transition-colors',
                        newCategory === cat.value ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                      )}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowNew(false)} className="px-3 py-1.5 bg-surface-800 text-surface-400 text-sm rounded-lg">Cancel</button>
                  <button onClick={handleCreate} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Brain size={48} className="mx-auto text-surface-700 mb-3" />
                <p className="text-surface-400">No memories yet</p>
                <p className="text-sm text-surface-500 mt-1">Add memories to help AdvutAI remember your preferences and context</p>
              </div>
            )}
            {filtered.map(m => (
              <div key={m.id} className="group bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-surface-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={12} className={CATEGORIES.find(c => c.value === m.category)?.color} />
                      <span className="text-xs text-surface-500 capitalize">{m.category}</span>
                      {m.auto_extracted && <span className="text-xs text-primary-400 font-medium ml-1">Auto-extracted</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-surface-200">{m.title}</h3>
                    <p className="text-sm text-surface-400 mt-1">{m.content}</p>
                  </div>
                  <button onClick={() => deleteMemory(m.id)} className="hidden group-hover:block p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-error-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
