import { User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className="message-body">
        <div className="message-role">{isUser ? 'You' : 'advutai'}</div>
        <div className="message-content">
          {message.content ? (
            message.content.split('\n').map((line, i) => (
              <p key={i}>
                {line.startsWith('**') && line.endsWith('**')
                  ? <strong>{line.slice(2, -2)}</strong>
                  : line.startsWith('- ')
                    ? <span className="list-item">{line}</span>
                    : line.match(/^\d+\.\s/)
                      ? <span className="list-item numbered">{line}</span>
                      : line}
              </p>
            ))
          ) : (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
