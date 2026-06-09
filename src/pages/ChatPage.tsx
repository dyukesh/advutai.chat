import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { AI_MODELS } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Plus, Pin, Archive, Trash2, Search,
  ChevronDown, MessageSquare, Bot, User
} from 'lucide-react';
import clsx from 'clsx';

export function ChatPage() {
  const {
    chats, activeChatId, messages, isSending, selectedModel,
    loadChats, createChat, deleteChat, setActiveChat,
    sendMessage, setSelectedModel, togglePinChat, toggleArchiveChat,
  } = useAppStore();
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const filteredChats = chats.filter(c =>
    !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.pinned && !c.archived);
  const activeChats = filteredChats.filter(c => !c.pinned && !c.archived);
  const archivedChats = filteredChats.filter(c => c.archived);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    await sendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full">
      {/* Chat list panel */}
      <div className={clsx(
        'border-r border-surface-800 flex flex-col bg-surface-900 transition-all',
        showChatList ? 'w-72' : 'w-0 overflow-hidden'
      )}>
        <div className="p-3 space-y-2">
          <button onClick={createChat} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> New Chat
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase tracking-wider">Pinned</p>
              {pinnedChats.map(c => (
                <ChatListItem key={c.id} chat={c} isActive={c.id === activeChatId} onClick={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />
              ))}
            </div>
          )}
          {activeChats.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase tracking-wider">Recent</p>
              {activeChats.map(c => (
                <ChatListItem key={c.id} chat={c} isActive={c.id === activeChatId} onClick={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />
              ))}
            </div>
          )}
          {archivedChats.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs font-semibold text-surface-500 uppercase tracking-wider">Archived</p>
              {archivedChats.map(c => (
                <ChatListItem key={c.id} chat={c} isActive={c.id === activeChatId} onClick={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-800">
          <button onClick={() => setShowChatList(!showChatList)} className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400">
            <MessageSquare size={18} />
          </button>
          <div className="flex-1 text-sm font-medium text-surface-200 truncate">
            {chats.find(c => c.id === activeChatId)?.title || 'New Chat'}
          </div>
          {/* Model picker */}
          <div className="relative">
            <button onClick={() => setShowModelPicker(!showModelPicker)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm text-surface-300 transition-colors">
              <Bot size={14} />
              {AI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
              <ChevronDown size={12} />
            </button>
            {showModelPicker && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-surface-900 border border-surface-700 rounded-xl shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
                {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'xAI', 'Mistral'].map(provider => {
                  const models = AI_MODELS.filter(m => m.provider === provider);
                  if (models.length === 0) return null;
                  return (
                    <div key={provider}>
                      <p className="px-3 py-1.5 text-xs font-semibold text-surface-500 uppercase">{provider}</p>
                      {models.map(m => (
                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                          className={clsx('w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-surface-800 transition-colors',
                            selectedModel === m.id ? 'text-primary-400' : 'text-surface-300'
                          )}>
                          <span>{m.name}</span>
                          <span className="text-xs text-surface-500">{m.description}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!activeChatId ? (
            <ChatWelcome onNewChat={createChat} onSuggestionClick={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map(msg => (
                <div key={msg.id} className={clsx('flex gap-3 animate-fade-in', msg.role === 'user' && 'flex-row-reverse')}>
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-primary-400 border border-surface-700'
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={clsx('min-w-0 max-w-[80%]',
                    msg.role === 'user' ? 'text-right' : ''
                  )}>
                    <p className="text-xs font-semibold text-surface-500 mb-1 uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'AdvutAI'}
                    </p>
                    {msg.content ? (
                      <div className={clsx(
                        'text-sm leading-relaxed rounded-xl',
                        msg.role === 'user'
                          ? 'bg-primary-700 text-white px-4 py-3 inline-block text-left'
                          : 'bg-surface-900 border border-surface-800 px-4 py-3'
                      )}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-1.5 px-4 py-3">
                        <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-surface-900 border border-surface-800 rounded-xl px-4 py-2 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Message AdvutAI..." rows={1}
                disabled={isSending}
                className="flex-1 bg-transparent text-sm text-surface-100 placeholder-surface-500 resize-none outline-none min-h-[24px] max-h-[160px] py-1"
              />
              <button onClick={handleSend} disabled={!input.trim() || isSending}
                className={clsx('p-2 rounded-lg transition-all',
                  input.trim() && !isSending ? 'bg-primary-600 text-white hover:bg-primary-500' : 'bg-surface-800 text-surface-500'
                )}>
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-xs text-surface-600 mt-2">AdvutAI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>

      {showModelPicker && <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />}
    </div>
  );
}

function ChatListItem({ chat, isActive, onClick, onDelete, onPin, onArchive }: {
  chat: { id: string; title: string; pinned: boolean; archived: boolean; updated_at: string };
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onPin: () => void;
  onArchive: () => void;
}) {
  return (
    <div onClick={onClick} className={clsx(
      'group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
      isActive ? 'bg-surface-800 text-surface-100' : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
    )}>
      <MessageSquare size={14} className="flex-shrink-0" />
      <span className="flex-1 text-sm truncate">{chat.title}</span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={e => { e.stopPropagation(); onPin(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-primary-400" title={chat.pinned ? 'Unpin' : 'Pin'}>
          <Pin size={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); onArchive(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-warning-400" title="Archive">
          <Archive size={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-error-400" title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function ChatWelcome({ onNewChat, onSuggestionClick }: { onNewChat: () => void; onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { label: 'Write code', text: 'Help me write a React component for a dashboard', icon: '{}' },
    { label: 'Analyze data', text: 'Analyze this dataset and find key trends', icon: '#' },
    { label: 'Research topic', text: 'Research the latest developments in quantum computing', icon: '?' },
    { label: 'Write content', text: 'Help me draft a professional email to my team', icon: '@' },
  ];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-lg px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 mb-6 animate-float">
          <Sparkles size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-50 mb-2">How can I help you today?</h1>
        <p className="text-surface-400 mb-8">Start a conversation or try a suggestion below</p>
        <button onClick={onNewChat} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-colors mb-8">
          <Plus size={18} /> New Chat
        </button>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s.text)} className="flex flex-col items-start gap-1 p-4 bg-surface-900 border border-surface-800 rounded-xl text-left hover:bg-surface-800 hover:border-surface-700 transition-all">
              <span className="text-primary-400 font-mono text-lg">{s.icon}</span>
              <span className="text-sm font-medium text-surface-200">{s.label}</span>
              <span className="text-xs text-surface-500 line-clamp-2">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Sparkles({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
