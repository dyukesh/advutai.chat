import { MessageSquarePlus, Trash2, X, Menu } from 'lucide-react';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: SidebarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {!isOpen && (
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Open sidebar">
          <Menu size={20} />
        </button>
      )}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <svg width="24" height="24" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="8" fill="#38BDF8" />
                <path d="M8 10h16v2H8zm0 5h12v2H8zm0 5h14v2H8z" fill="#0F172A" />
              </svg>
            </div>
            <span className="sidebar-title">advutai.chat</span>
          </div>
          <button className="sidebar-close" onClick={onToggle} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNew}>
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>

        <div className="conversation-list">
          {conversations.length === 0 && (
            <div className="empty-conversations">
              <p>No conversations yet</p>
              <p className="empty-hint">Start a new chat to begin</p>
            </div>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${activeId === conv.id ? 'active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="conversation-item-content">
                <span className="conversation-item-title">{conv.title}</span>
                <span className="conversation-item-date">{formatDate(conv.updated_at)}</span>
              </div>
              <button
                className="conversation-delete"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                aria-label="Delete conversation"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
    </>
  );
}
