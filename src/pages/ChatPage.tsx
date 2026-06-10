import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { AI_MODELS } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Plus, Pin, Archive, Trash2, Search,
  ChevronDown, MessageSquare, Sparkles, PanelLeftClose, PanelLeft, Info, Zap
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
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
      {/* Sidebar - Chat List */}
      <aside className={clsx(
        'flex flex-col bg-surface-900/50 border-r border-surface-800/60 transition-all duration-300 ease-out',
        showChatList ? 'w-64' : 'w-0 overflow-hidden'
      )}>
        <div className="p-4 space-y-3">
          <button onClick={createChat}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 active:scale-[0.98] text-white py-2.5 rounded-xl text-[13px] font-medium transition-all shadow-lg shadow-primary-600/20">
            <Plus size={16} /> New Chat
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-surface-800/80 border border-surface-700/50 rounded-lg pl-9 pr-3 py-2 text-[13px] text-surface-200 placeholder-surface-500 focus:border-primary-500/50 focus:bg-surface-800 outline-none transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
          {pinnedChats.length > 0 && (
            <div>
              <p className="px-1 mb-1.5 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Pinned</p>
              <div className="space-y-0.5">{pinnedChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}</div>
            </div>
          )}
          {activeChats.length > 0 && (
            <div>
              <p className="px-1 mb-1.5 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Recent</p>
              <div className="space-y-0.5">{activeChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}</div>
            </div>
          )}
          {archivedChats.length > 0 && (
            <div>
              <p className="px-1 mb-1.5 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">Archived</p>
              <div className="space-y-0.5">{archivedChats.map(c => <ChatItem key={c.id} chat={c} active={c.id === activeChatId} onSelect={() => setActiveChat(c.id)} onDelete={() => deleteChat(c.id)} onPin={() => togglePinChat(c.id)} onArchive={() => toggleArchiveChat(c.id)} />)}</div>
            </div>
          )}
          {!pinnedChats.length && !activeChats.length && !archivedChats.length && (
            <div className="text-center py-10">
              <MessageSquare size={28} className="mx-auto text-surface-700 mb-3" />
              <p className="text-[13px] text-surface-500">No conversations yet</p>
            </div>
          )}
        </div>

        {/* Demo Mode Notice */}
        <div className="mx-3 mb-3 p-3 rounded-lg bg-warning-500/10 border border-warning-500/20">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-warning-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-warning-300">Demo Mode</p>
              <p className="text-[10px] text-surface-500 mt-0.5 leading-relaxed">AI responses are simulated. Add an OpenAI API key in settings for real responses.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 h-11 border-b border-surface-800/40 bg-surface-950/80 backdrop-blur-sm">
          <button onClick={() => setShowChatList(!showChatList)}
            className="p-1.5 rounded-lg hover:bg-surface-800/60 text-surface-500 hover:text-surface-300 transition-colors">
            {showChatList ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <div className="flex-1 text-[13px] font-medium text-surface-400 truncate">
            {chats.find(c => c.id === activeChatId)?.title || 'New Conversation'}
          </div>

          {/* Model Picker */}
          <div className="relative">
            <button onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/60 hover:bg-surface-800 border border-surface-700/40 text-[13px] transition-colors">
              <span className={clsx('w-2 h-2 rounded-full',
                currentModel?.provider === 'OpenAI' ? 'bg-green-400' :
                currentModel?.provider === 'Anthropic' ? 'bg-orange-400' :
                currentModel?.provider === 'Google' ? 'bg-blue-400' :
                'bg-primary-400'
              )} />
              <span className="text-surface-300">{currentModel?.name}</span>
              <ChevronDown size={12} className="text-surface-500" />
            </button>

            {showModelPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                <div className="absolute right-0 top-full mt-1 w-72 bg-surface-900 border border-surface-700/60 rounded-xl shadow-2xl z-50 py-1.5 max-h-80 overflow-y-auto">
                  {['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'xAI', 'Mistral'].map(provider => {
                    const models = AI_MODELS.filter(m => m.provider === provider);
                    if (!models.length) return null;
                    return (
                      <div key={provider}>
                        <p className="px-3 py-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-wider">{provider}</p>
                        {models.map(m => (
                          <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                            className={clsx('w-full text-left px-3 py-2 text-[13px] hover:bg-surface-800/60 transition-colors',
                              selectedModel === m.id ? 'bg-primary-600/10 text-primary-400' : 'text-surface-300'
                            )}>
                            <div className="flex items-center gap-2">
                              <span className={clsx('w-1.5 h-1.5 rounded-full',
                                provider === 'OpenAI' ? 'bg-green-400' :
                                provider === 'Anthropic' ? 'bg-orange-400' :
                                provider === 'Google' ? 'bg-blue-400' :
                                'bg-primary-400'
                              )} />
                              <span className="font-medium">{m.name}</span>
                            </div>
                            <p className="text-[11px] text-surface-500 mt-0.5 ml-3.5">{m.description}</p>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!activeChatId ? (
            <WelcomeScreen onNewChat={createChat} onSuggestionClick={sendMessage} />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-surface-900/80 border border-surface-700/40 rounded-2xl px-4 py-2.5 focus-within:border-primary-500/40 focus-within:bg-surface-900 transition-all">
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Message AdvutAI..." rows={1}
                className="flex-1 bg-transparent text-[13px] text-surface-100 placeholder-surface-500 resize-none outline-none min-h-[20px] max-h-[120px] leading-relaxed py-0.5" />
              <button onClick={handleSend} disabled={!input.trim() || isSending}
                className={clsx('flex-shrink-0 p-2 rounded-xl transition-all',
                  input.trim() && !isSending
                    ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20'
                    : 'bg-surface-800/50 text-surface-600'
                )}>
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[10px] text-surface-600 mt-2">
              Demo mode: Responses are simulated for demonstration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatItem({ chat, active, onSelect, onDelete, onPin, onArchive }: {
  chat: { id: string; title: string; pinned: boolean; archived: boolean };
  active: boolean; onSelect: () => void; onDelete: () => void; onPin: () => void; onArchive: () => void;
}) {
  return (
    <div onClick={onSelect}
      className={clsx('group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
        active ? 'bg-surface-800/70 text-surface-100' : 'text-surface-400 hover:bg-surface-800/40 hover:text-surface-200'
      )}>
      <MessageSquare size={13} className="flex-shrink-0 opacity-50" />
      <span className="flex-1 text-[13px] truncate">{chat.title}</span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button onClick={e => { e.stopPropagation(); onPin(); }}
          className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-primary-400 transition-colors">
          <Pin size={11} />
        </button>
        <button onClick={e => { e.stopPropagation(); onArchive(); }}
          className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-warning-400 transition-colors">
          <Archive size={11} />
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-error-400 transition-colors">
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
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-[13px] leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (!message.content) {
    return (
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded-lg bg-surface-800 border border-surface-700/50 flex items-center justify-center">
          <Sparkles size={11} className="text-primary-400" />
        </div>
        <div className="flex gap-1">
          <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-surface-800/80 border border-surface-700/50 flex items-center justify-center">
          <Sparkles size={11} className="text-primary-400" />
        </div>
        <span className="text-[12px] font-medium text-surface-400">AdvutAI</span>
        {message.model && (
          <span className="text-[10px] text-surface-500 bg-surface-800/60 px-2 py-0.5 rounded-full">{message.model}</span>
        )}
      </div>
      <div className="bg-surface-900/50 border border-surface-800/50 rounded-xl rounded-tl-none px-4 py-3">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNewChat, onSuggestionClick }: { onNewChat: () => void; onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { title: 'Write code', desc: 'Build a REST API with authentication', prompt: 'Help me build a REST API with JWT authentication in Node.js and Express' },
    { title: 'Analyze data', desc: 'SaaS market trends for 2025', prompt: 'Analyze the key trends in the SaaS market for 2025' },
    { title: 'Debug issue', desc: 'Fix infinite re-render', prompt: 'I have a React component that re-renders infinitely. Help me find and fix the cause.' },
    { title: 'Create content', desc: 'Draft professional email', prompt: 'Draft a professional email proposing a new project timeline to stakeholders' },
  ];

  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-400 mb-4 shadow-lg shadow-primary-500/20 animate-float">
          <Sparkles size={22} className="text-white" />
        </div>

        <h1 className="text-xl font-semibold text-surface-100 mb-1">How can I help you?</h1>
        <p className="text-[13px] text-surface-500 mb-6">Start a conversation or try a suggestion below</p>

        <button onClick={onNewChat}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all shadow-lg shadow-primary-600/20 mb-6">
          <Plus size={16} /> New Chat
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestionClick(s.prompt)}
              className="text-left p-3.5 bg-surface-900/40 border border-surface-800/50 rounded-xl hover:bg-surface-800/50 hover:border-surface-700/50 transition-all group">
              <p className="text-[13px] font-medium text-surface-200 group-hover:text-primary-400 transition-colors">{s.title}</p>
              <p className="text-[11px] text-surface-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-surface-600">
          <Zap size={12} />
          <span>Demo mode — simulated responses for demonstration</span>
        </div>
      </div>
    </div>
  );
}
