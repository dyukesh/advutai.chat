import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import {
  MessageSquare, FolderKanban, SquareCheck as CheckSquare, Brain, Search,
  FileText, PenTool, Settings, CreditCard, ChartBar as BarChart3, Menu,
  LogOut, Sparkles, ChevronLeft, Users, Code as Code2, Image, Mic, Zap
} from 'lucide-react';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'AI Tools',
    items: [
      { to: '/chat', icon: MessageSquare, label: 'Chat' },
      { to: '/code', icon: Code2, label: 'Code Assistant' },
      { to: '/research', icon: Search, label: 'Research' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { to: '/workspace', icon: FolderKanban, label: 'Workspace' },
      { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { to: '/memory', icon: Brain, label: 'Memory' },
      { to: '/files', icon: FileText, label: 'Files' },
    ],
  },
  {
    label: 'Creative',
    items: [
      { to: '/content', icon: PenTool, label: 'Content Studio' },
      { to: '/image-gen', icon: Image, label: 'Image Gen' },
      { to: '/voice', icon: Mic, label: 'Voice' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/billing', icon: CreditCard, label: 'Billing' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/team', icon: Users, label: 'Team' },
    ],
  },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar, session, profile, signOut } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-surface-950 text-surface-100 overflow-hidden">
      {/* Sidebar — inline flex, no fixed positioning */}
      <aside
        style={{ width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0 }}
        className="flex flex-col bg-surface-900 border-r border-surface-800 transition-all duration-250 overflow-hidden"
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-surface-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">AdvutAI</span>
            <span className="text-[10px] font-medium text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">BETA</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-200 transition-colors shrink-0"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold text-surface-600 uppercase tracking-widest whitespace-nowrap">
                {group.label}
              </p>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5 whitespace-nowrap',
                    isActive
                      ? 'bg-primary-600/15 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={15} className={clsx('shrink-0', isActive ? 'text-primary-400' : 'text-surface-500')} />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Upgrade CTA */}
        <div className="mx-2 mb-2 p-3 rounded-xl bg-primary-600/10 border border-primary-500/20 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={13} className="text-primary-400 shrink-0" />
            <span className="text-[12px] font-semibold text-primary-300 whitespace-nowrap">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-surface-500 leading-relaxed">Unlimited AI, all models & more</p>
        </div>

        {/* User row */}
        <div className="px-2 pb-2 pt-1 border-t border-surface-800 shrink-0">
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-800/60 transition-colors cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {(profile?.display_name || session?.user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-surface-200 truncate">
                {profile?.display_name || session?.user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-surface-500 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); signOut(); navigate('/login'); }}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-error-400 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 h-12 border-b border-surface-800/50 bg-surface-950/80 shrink-0">
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="flex-1" />
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
