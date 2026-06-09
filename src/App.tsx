import { useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useChat } from './hooks/useChat';

export default function App() {
  const {
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
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    await createConversation();
  };

  const handleSuggestionClick = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="chat-main">
        {!activeConversationId ? (
          <WelcomeScreen onNewChat={handleNewChat} onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            <div className="chat-messages">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={sendMessage} disabled={isSending} />
          </>
        )}
      </main>
    </div>
  );
}
