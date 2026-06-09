import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { AI_MODELS } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Plus, Pin, Archive, Trash2, Search,
  ChevronDown, MessageSquare, Sparkles, PanelLeftClose, PanelLeft
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
    const msg = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const currentModel = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="flex h-full bg-surface-950">
      {/* Chat list */}
      <div className={clsx(
        'flex flex-col border-r border-surface-800 bg-surface-900 transition-all duration-200',
        showChatList ? 'w-72' : 'w-0 overflow-hidden border-0'
      )}>
        <div className="p-3 space-y-2">
          <button onClick={createChat} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> New Chat
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-3 py-2 text-sm text-surface-200 placeholder-surface-500 focus:border-primary-500 outline-none transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold text-surface-500 uppercase tracking-widest">Pinned</p>
              {pinnedChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}
            </div>
          )}
          {activeChats.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1.5 text-[11px] font-semibold text-surface-500 uppercase tracking-widest">Recent</p>
              {activeChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}
            </div>
          )}
          {archivedChats.length > 0 && (
            <div>
              <p className="px-2 py-1.5 text-[11px] font-semibold text-surface-500 uppercase tracking-widest">Archived</p>
              {archivedChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}
            </div>
          )}
          {!pinnedChats.length && !activeChats.length && !archivedChats.length && (
            <div className="text-center py-8 px-4">
              <MessageSquare size={24} className="mx-auto text-surface-700 mb-2" />
              <p className="text-sm text-surface-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-12 border-b border-surface-800/60 bg-surface-950">
          <button onClick={() => setShowChatList(!showChatList)} className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
            {showChatList ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <div className="flex-1 text-sm font-medium text-surface-300 truncate">
            {chats.find(c => c.id === activeChatId)?.title || 'New Chat'}
          </div>
          {/* Model picker */}
          <div className="relative">
            <button onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/80 hover:bg-surface-800 border border-surface-700/50 text-sm transition-colors">
              <div className={clsx('w-2 h-2 rounded-full',
                currentModel?.provider === 'OpenAI' ? 'bg-green-400' :
                currentModel?.provider === 'Anthropic' ? 'bg-orange-400' :
                currentModel?.provider === 'Google' ? 'bg-blue-400' :
                currentModel?.provider === 'DeepSeek' ? 'bg-cyan-400' :
                currentModel?.provider === 'xAI' ? 'bg-surface-300' :
                'bg-primary-400'
              )} />
              <span className="text-surface-200">{currentModel?.name || selectedModel}</span>
              <ChevronDown size={12} className="text-surface-500" />
            </button>
            {showModelPicker && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-50 py-1 max-h-96 overflow-y-auto">
                {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'xAI', 'Mistral'].map(provider => {
                  const models = AI_MODELS.filter(m => m.provider === provider);
                  if (!models.length) return null;
                  return (
                    <div key={provider}>
                      <p className="px-3 py-2 text-[11px] font-semibold text-surface-500 uppercase tracking-widest">{provider}</p>
                      {models.map(m => (
                        <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                          className={clsx('w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface-800 transition-colors',
                            selectedModel === m.id ? 'text-primary-400 bg-primary-600/5' : 'text-surface-300'
                          )}>
                          <div className={clsx('w-2 h-2 rounded-full flex-shrink-0',
                            provider === 'OpenAI' ? 'bg-green-400' :
                            provider === 'Anthropic' ? 'bg-orange-400' :
                            provider === 'Google' ? 'bg-blue-400' :
                            provider === 'DeepSeek' ? 'bg-cyan-400' :
                            provider === 'xAI' ? 'bg-surface-300' :
                            'bg-primary-400'
                          )} />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{m.name}</span>
                            <p className="text-xs text-surface-500">{m.description}</p>
                          </div>
                          {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!activeChatId ? (
            <WelcomeScreen onNewChat={createChat} onSuggestionClick={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-surface-900 border border-surface-700/50 rounded-2xl px-4 py-3 focus-within:border-primary-500/50 focus-within:shadow-lg focus-within:shadow-primary-500/5 transition-all">
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Message AdvutAI..." rows={1} disabled={isSending}
                className="flex-1 bg-transparent text-sm text-surface-100 placeholder-surface-500 resize-none outline-none min-h-[24px] max-h-[160px] py-0.5 leading-relaxed" />
              <button onClick={handleSend} disabled={!input.trim() || isSending}
                className={clsx('p-2 rounded-xl transition-all flex-shrink-0',
                  input.trim() && !isSending ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20' : 'bg-surface-800 text-surface-500'
                )}>
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[11px] text-surface-600 mt-2">AdvutAI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>

      {showModelPicker && <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />}
    </div>
  );
}

function ChatItem({ chat, active, onSelect, onDelete, onPin, onArchive }: {
  chat: { id: string; title: string; pinned: boolean; archived: boolean; updated_at: string };
  active: boolean; onSelect: () => void; onDelete: () => void; onPin: () => void; onArchive: () => void;
}) {
  return (
    <div onClick={onSelect} className={clsx(
      'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all',
      active ? 'bg-surface-800 text-surface-100' : 'text-surface-400 hover:bg-surface-800/40 hover:text-surface-200'
    )}>
      <MessageSquare size={14} className="flex-shrink-0 opacity-50" />
      <span className="flex-1 text-sm truncate">{chat.title}</span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={e => { e.stopPropagation(); onPin(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-primary-400 transition-colors" title={chat.pinned ? 'Unpin' : 'Pin'}>
          <Pin size={11} />
        </button>
        <button onClick={e => { e.stopPropagation(); onArchive(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-warning-400 transition-colors" title="Archive">
          <Archive size={11} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-error-400 transition-colors" title="Delete">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: { id: string; role: string; content: string; model?: string | null } }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div className="max-w-[75%] bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (!message.content) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="w-6 h-6 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center">
            <Sparkles size={12} className="text-primary-400" />
          </div>
          <div className="flex gap-1.5">
            <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-surface-800 border border-surface-700 flex items-center justify-center">
            <Sparkles size={10} className="text-primary-400" />
          </div>
          <span className="text-[11px] font-medium text-surface-500">AdvutAI</span>
          {message.model && <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">{message.model}</span>}
        </div>
        <div className="bg-surface-900/50 border border-surface-800/40 rounded-2xl rounded-tl-md px-5 py-4">
          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-headings:my-3 prose-headings:text-surface-200 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-primary-300 prose-code:text-primary-300 prose-code:bg-surface-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px] prose-code:before:content-[''] prose-code:after:content-[''] prose-pre:bg-surface-950 prose-pre:border prose-pre:border-surface-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNewChat, onSuggestionClick }: { onNewChat: () => void; onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { label: 'Write code', text: 'Help me build a REST API with authentication in Node.js', emoji: '{ }' },
    { label: 'Analyze data', text: 'Analyze the key trends in the SaaS market for 2025', emoji: '#' },
    { label: 'Debug issue', text: 'I have a React component that re-renders infinitely, help me find the cause', emoji: '?' },
    { label: 'Write content', text: 'Draft a professional email proposing a new project timeline to stakeholders', emoji: '@' },
  ];

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 mb-5 animate-float shadow-lg shadow-primary-500/20">
          <Sparkles size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-surface-50 mb-2">What can I help you with?</h1>
        <p className="text-surface-400 text-sm mb-8">Start a conversation or try a suggestion below</p>
        <button onClick={onNewChat} className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors mb-8 shadow-lg shadow-primary-600/20">
          <Plus size={16} /> New Chat
        </button>
        <div className="grid grid-cols-2 gap-3 text-left">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s.text)}
              className="flex flex-col items-start gap-1.5 p-4 bg-surface-900/50 border border-surface-800/50 rounded-xl hover:bg-surface-800/50 hover:border-surface-700/50 transition-all group">
              <span className="text-primary-400/70 font-mono text-sm group-hover:text-primary-400 transition-colors">{s.emoji}</span>
              <span className="text-sm font-medium text-surface-200 group-hover:text-surface-100 transition-colors">{s.label}</span>
              <span className="text-xs text-surface-500 line-clamp-2">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
