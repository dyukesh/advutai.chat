import { Code, PenTool, Lightbulb, BookOpen, MessageSquarePlus, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onNewChat: () => void;
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  { icon: Code, label: 'Write code', text: 'Help me write a React component for a dashboard' },
  { icon: PenTool, label: 'Write content', text: 'Help me draft a professional email' },
  { icon: Lightbulb, label: 'Brainstorm ideas', text: 'What are some creative project ideas for a portfolio?' },
  { icon: BookOpen, label: 'Explain a concept', text: 'Explain how machine learning works in simple terms' },
];

export function WelcomeScreen({ onNewChat, onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <Sparkles size={32} className="welcome-sparkle" />
        </div>
        <h1 className="welcome-title">How can I help you today?</h1>
        <p className="welcome-subtitle">Start a conversation or try a suggestion below</p>

        <button className="welcome-new-chat" onClick={onNewChat}>
          <MessageSquarePlus size={20} />
          <span>Start new chat</span>
        </button>

        <div className="suggestions-grid">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-card"
              onClick={() => onSuggestionClick(s.text)}
            >
              <s.icon size={20} className="suggestion-icon" />
              <span className="suggestion-label">{s.label}</span>
              <span className="suggestion-text">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
