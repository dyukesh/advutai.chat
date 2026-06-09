import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, Chat, Message, Task, Project, Memory, ResearchReport } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Auth
  session: { user: { id: string; email: string } } | null;
  profile: Profile | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;

  // Chat
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isSending: boolean;
  selectedModel: string;
  loadChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  deleteChat: (id: string) => Promise<void>;
  setActiveChat: (id: string | null) => void;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setSelectedModel: (model: string) => void;
  togglePinChat: (id: string) => Promise<void>;
  toggleArchiveChat: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  loadTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Projects
  projects: Project[];
  loadProjects: () => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Memories
  memories: Memory[];
  loadMemories: () => Promise<void>;
  createMemory: (memory: Partial<Memory>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Research
  researchReports: ResearchReport[];
  loadResearchReports: () => Promise<void>;
  createResearchReport: (query: string) => Promise<string | null>;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  session: null,
  profile: null,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      set({ session: { user: { id: session.user.id, email: session.user.email ?? '' } }, profile, initialized: true });
    } else {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          set({ session: { user: { id: session.user.id, email: session.user.email ?? '' } }, profile });
        } else {
          set({ session: null, profile: null, chats: [], messages: [], tasks: [], projects: [], memories: [], researchReports: [] });
        }
      })();
    });
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, chats: [], messages: [], tasks: [], projects: [], memories: [], researchReports: [] });
  },

  updateProfile: async (updates) => {
    const { session } = get();
    if (!session) return;
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id);
    if (!error) {
      set(prev => ({ profile: prev.profile ? { ...prev.profile, ...updates } : null }));
    }
  },

  // Chat
  chats: [],
  activeChatId: null,
  messages: [],
  isSending: false,
  selectedModel: 'gpt-4o',

  loadChats: async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });
    if (!error) set({ chats: data || [] });
  },

  createChat: async () => {
    const id = uuidv4();
    const model = get().selectedModel;
    const { data, error } = await supabase
      .from('chats')
      .insert({ id, title: 'New Chat', model })
      .select()
      .maybeSingle();
    if (error || !data) return null;
    set(prev => ({ chats: [data, ...prev.chats], activeChatId: data.id, messages: [] }));
    return data.id;
  },

  deleteChat: async (id) => {
    await supabase.from('chats').delete().eq('id', id);
    set(prev => ({
      chats: prev.chats.filter(c => c.id !== id),
      activeChatId: prev.activeChatId === id ? null : prev.activeChatId,
      messages: prev.activeChatId === id ? [] : prev.messages,
    }));
  },

  setActiveChat: (id) => {
    set({ activeChatId: id });
    if (id) get().loadMessages(id);
    else set({ messages: [] });
  },

  loadMessages: async (chatId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (!error) set({ messages: data || [] });
  },

  sendMessage: async (content) => {
    const { activeChatId, isSending, selectedModel, messages } = get();
    if (!content.trim() || isSending) return;
    set({ isSending: true });

    let chatId = activeChatId;
    try {
      if (!chatId) {
        const newId = await get().createChat();
        if (!newId) { set({ isSending: false }); return; }
        chatId = newId;
      }

      const userMsg: Message = {
        id: uuidv4(), chat_id: chatId, role: 'user', content: content.trim(),
        model: null, tokens_used: 0, created_at: new Date().toISOString(),
      };
      set(prev => ({ messages: [...prev.messages, userMsg] }));
      await supabase.from('messages').insert(userMsg);

      const isFirst = get().messages.filter(m => m.role === 'user').length <= 1;
      if (isFirst) {
        const title = content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '');
        await supabase.from('chats').update({ title, updated_at: new Date().toISOString() }).eq('id', chatId);
        set(prev => ({ chats: prev.chats.map(c => c.id === chatId ? { ...c, title, updated_at: new Date().toISOString() } : c) }));
      }

      const placeholderId = uuidv4();
      const assistantMsg: Message = {
        id: placeholderId, chat_id: chatId, role: 'assistant', content: '',
        model: selectedModel, tokens_used: 0, created_at: new Date().toISOString(),
      };
      set(prev => ({ messages: [...prev.messages, assistantMsg] }));

      // Build history from existing messages (last 20 for context)
      const history = messages
        .filter(m => m.content && m.role !== 'system')
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ message: content.trim(), model: selectedModel, history }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const result = await res.json();
      const fullContent = result.response || 'I encountered an issue. Please try again.';

      const words = fullContent.split(' ');
      let accumulated = '';
      for (let i = 0; i < words.length; i++) {
        accumulated += (i > 0 ? ' ' : '') + words[i];
        const current = accumulated;
        set(prev => ({
          messages: prev.messages.map(m => m.id === placeholderId ? { ...m, content: current } : m),
        }));
        await new Promise(r => setTimeout(r, 20));
      }

      await supabase.from('messages').insert({ ...assistantMsg, content: fullContent });
      set(prev => ({
        messages: prev.messages.map(m => m.id === placeholderId ? { ...m, content: fullContent } : m),
      }));

      await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
      await supabase.from('usage_logs').insert({ feature: 'chat', model: selectedModel, tokens_used: Math.ceil(fullContent.length / 4) });
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      set({ isSending: false });
    }
  },

  setSelectedModel: (model) => set({ selectedModel: model }),

  togglePinChat: async (id) => {
    const chat = get().chats.find(c => c.id === id);
    if (!chat) return;
    const pinned = !chat.pinned;
    await supabase.from('chats').update({ pinned }).eq('id', id);
    set(prev => ({ chats: prev.chats.map(c => c.id === id ? { ...c, pinned } : c) }));
  },

  toggleArchiveChat: async (id) => {
    const chat = get().chats.find(c => c.id === id);
    if (!chat) return;
    const archived = !chat.archived;
    await supabase.from('chats').update({ archived }).eq('id', id);
    set(prev => ({ chats: prev.chats.map(c => c.id === id ? { ...c, archived } : c) }));
  },

  // Tasks
  tasks: [],

  loadTasks: async () => {
    const { data, error } = await supabase.from('tasks').select('*').order('sort_order');
    if (!error) set({ tasks: data || [] });
  },

  createTask: async (task) => {
    const id = uuidv4();
    const newTask = { id, title: task.title || 'New Task', status: task.status || 'todo', priority: task.priority || 'medium', ...task };
    const { data, error } = await supabase.from('tasks').insert(newTask).select().maybeSingle();
    if (!error && data) set(prev => ({ tasks: [...prev.tasks, data] }));
  },

  updateTask: async (id, updates) => {
    await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    set(prev => ({ tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }));
  },

  deleteTask: async (id) => {
    await supabase.from('tasks').delete().eq('id', id);
    set(prev => ({ tasks: prev.tasks.filter(t => t.id !== id) }));
  },

  // Projects
  projects: [],

  loadProjects: async () => {
    const { data, error } = await supabase.from('projects').select('*').order('sort_order');
    if (!error) set({ projects: data || [] });
  },

  createProject: async (project) => {
    const id = uuidv4();
    const { data, error } = await supabase.from('projects').insert({ id, name: project.name || 'New Project', ...project }).select().maybeSingle();
    if (!error && data) set(prev => ({ projects: [...prev.projects, data] }));
  },

  deleteProject: async (id) => {
    await supabase.from('projects').delete().eq('id', id);
    set(prev => ({ projects: prev.projects.filter(p => p.id !== id) }));
  },

  // Memories
  memories: [],

  loadMemories: async () => {
    const { data, error } = await supabase.from('memories').select('*').order('updated_at', { ascending: false });
    if (!error) set({ memories: data || [] });
  },

  createMemory: async (memory) => {
    const id = uuidv4();
    const { data, error } = await supabase.from('memories').insert({ id, title: memory.title || 'New Memory', content: memory.content || '', category: memory.category || 'general', ...memory }).select().maybeSingle();
    if (!error && data) set(prev => ({ memories: [data, ...prev.memories] }));
  },

  deleteMemory: async (id) => {
    await supabase.from('memories').delete().eq('id', id);
    set(prev => ({ memories: prev.memories.filter(m => m.id !== id) }));
  },

  // Research
  researchReports: [],

  loadResearchReports: async () => {
    const { data, error } = await supabase.from('research_reports').select('*').order('created_at', { ascending: false });
    if (!error) set({ researchReports: data || [] });
  },

  createResearchReport: async (query) => {
    const id = uuidv4();
    const { data, error } = await supabase.from('research_reports').insert({ id, title: `Research: ${query.slice(0, 50)}`, query, status: 'researching' }).select().maybeSingle();
    if (error || !data) return null;

    set(prev => ({ researchReports: [data, ...prev.researchReports] }));

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ query, reportId: id }),
      });

      if (res.ok) {
        const result = await res.json();
        const { summary, sources, report_content } = result;
        await supabase.from('research_reports').update({ summary, sources, report_content, status: 'completed' }).eq('id', id);
        set(prev => ({
          researchReports: prev.researchReports.map(r =>
            r.id === id ? { ...r, summary, sources, report_content, status: 'completed' } : r
          ),
        }));
      } else {
        await supabase.from('research_reports').update({ status: 'failed' }).eq('id', id);
        set(prev => ({
          researchReports: prev.researchReports.map(r => r.id === id ? { ...r, status: 'failed' } : r),
        }));
      }
    } catch {
      await supabase.from('research_reports').update({ status: 'failed' }).eq('id', id);
    }

    return id;
  },

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set(prev => ({ sidebarOpen: !prev.sidebarOpen })),
}));
