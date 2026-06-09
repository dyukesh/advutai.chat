import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message } from '../types';

const CHAT_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const streamingRef = useRef<string>('');

  const loadConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load conversations:', error);
      return;
    }
    setConversations(data || []);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      return;
    }
    setMessages(data || []);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  const createConversation = useCallback(async (): Promise<string | null> => {
    const id = uuidv4();
    const { data, error } = await supabase
      .from('conversations')
      .insert({ id, title: 'New Chat' })
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to create conversation:', error);
      return null;
    }
    setConversations(prev => [data, ...prev]);
    setActiveConversationId(data.id);
    setMessages([]);
    return data.id;
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete conversation:', error);
      return;
    }
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Failed to update title:', error);
      return;
    }
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c))
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending) return;

    let conversationId = activeConversationId;
    setIsSending(true);

    try {
      if (!conversationId) {
        const newId = await createConversation();
        if (!newId) return;
        conversationId = newId;
      }

      const userMessage: Message = {
        id: uuidv4(),
        conversation_id: conversationId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      const { error: msgError } = await supabase
        .from('messages')
        .insert(userMessage);

      if (msgError) {
        console.error('Failed to save message:', msgError);
      }

      if (messages.length === 0) {
        const title = content.trim().slice(0, 50) + (content.trim().length > 50 ? '...' : '');
        await updateConversationTitle(conversationId, title);
      }

      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      const assistantPlaceholder: Message = {
        id: uuidv4(),
        conversation_id: conversationId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantPlaceholder]);

      const response = await fetch(CHAT_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const result = await response.json();
      const assistantContent = result.response || 'I encountered an issue. Please try again.';

      streamingRef.current = '';
      const words = assistantContent.split(' ');

      for (let i = 0; i < words.length; i++) {
        streamingRef.current += (i > 0 ? ' ' : '') + words[i];
        const currentText = streamingRef.current;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantPlaceholder.id
              ? { ...m, content: currentText }
              : m
          )
        );
        await new Promise(r => setTimeout(r, 25));
      }

      const { error: saveError } = await supabase
        .from('messages')
        .insert({
          ...assistantPlaceholder,
          content: assistantContent,
        });

      if (saveError) {
        console.error('Failed to save assistant message:', saveError);
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantPlaceholder.id
            ? { ...m, content: assistantContent }
            : m
        )
      );

    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  }, [activeConversationId, isSending, messages, createConversation, updateConversationTitle]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isSending,
    sidebarOpen,
    setSidebarOpen,
    createConversation,
    deleteConversation,
    sendMessage,
  };
}
