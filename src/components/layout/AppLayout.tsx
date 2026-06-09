import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store';
import { MessageSquare, FolderKanban, SquareCheck as CheckSquare, Brain, Search, FileText, PenTool, Settings, CreditCard, ChartBar as BarChart3, Menu, LogOut, Sparkles, ChevronLeft, Users, Code as Code2, Image, Mic, Zap } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/chat', icon: MessageSquare, label: 'Chat', shortcut: 'AI' },
  { to: '/code', icon: Code2, label: 'Code', shortcut: '</>' },
  { to: '/workspace', icon: FolderKanban, label: 'Workspace', shortcut: null },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', shortcut: null },
  { to: '/memory', icon: Brain, label: 'Memory', shortcut: null },
  { to: '/research', icon: Search, label: 'Research', shortcut: null },
  { to: '/files', icon: FileText, label: 'Files', shortcut: null },
  { to: '/content', icon: PenTool, label: 'Content', shortcut: null },
  { to: '/image-gen', icon: Image, label: 'Images', shortcut: null },
  { to: '/voice', icon: Mic, label: 'Voice', shortcut: null },
  { to: '/team', icon: Users, label: 'Team', shortcut: null },
];

const BOTTOM_ITEMS = [
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar, session, profile, signOut } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-surface-950 text-surface-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-900/95 backdrop-blur-xl border-r border-surface-800/50 transition-all duration-300 ease-out',
        sidebarOpen ? 'w-60' : 'w-0 -translate-x-full'
      )}>
        <div className={clsx('flex flex-col h-full opacity-0 transition-opacity duration-200', sidebarOpen && 'opacity-100')}>
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-surface-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight">AdvutAI</span>
                <span className="ml-1.5 text-[10px] font-medium text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">BETA</span>
              </div>
            </div>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-thin">
            <p className="px-2.5 py-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-[0.1em]">AI Tools</p>
            {NAV_ITEMS.slice(0, 2).map(item => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} />
            ))}

            <p className="px-2.5 py-1.5 mt-2 text-[10px] font-bold text-surface-500 uppercase tracking-[0.1em]">Productivity</p>
            {NAV_ITEMS.slice(2, 6).map(item => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} />
            ))}

            <p className="px-2.5 py-1.5 mt-2 text-[10px] font-bold text-surface-500 uppercase tracking-[0.1em]">Creative</p>
            {NAV_ITEMS.slice(6, 10).map(item => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} />
            ))}

            <p className="px-2.5 py-1.5 mt-2 text-[10px] font-bold text-surface-500 uppercase tracking-[0.1em]">Team</p>
            {NAV_ITEMS.slice(10).map(item => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} />
            ))}

            <div className="my-3 border-t border-surface-800/50" />

            <p className="px-2.5 py-1.5 text-[10px] font-bold text-surface-500 uppercase tracking-[0.1em]">Account</p>
            {BOTTOM_ITEMS.map(item => (
              <NavItem key={item.to} item={item} active={location.pathname === item.to} />
            ))}
          </nav>

          {/* Upgrade CTA */}
          <div className="mx-3 mb-2 p-3 rounded-xl bg-gradient-to-br from-primary-600/20 to-primary-500/5 border border-primary-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={14} className="text-primary-400" />
              <span className="text-xs font-semibold text-primary-300">Upgrade to Pro</span>
            </div>
            <p className="text-[11px] text-surface-500 leading-relaxed">Unlimited AI usage, all models, research & more</p>
          </div>

          {/* User */}
          <div className="px-3 pb-3 pt-2 border-t border-surface-800/50">
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-surface-800/50 transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary-500/20">
                {(profile?.display_name || session?.user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-surface-200">{profile?.display_name || 'User'}</p>
                <p className="text-[11px] text-surface-500 truncate">{session?.user.email}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); signOut(); navigate('/login'); }}
                className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-error-400 transition-colors" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}

      {/* Main content */}
      <div className={clsx('flex-1 flex flex-col min-w-0 transition-all duration-300', sidebarOpen && 'md:ml-60')}>
        <header className="flex items-center gap-3 px-4 h-12 border-b border-surface-800/40 bg-surface-950/90 backdrop-blur-xl sticky top-0 z-20">
          {!sidebarOpen && (
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
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

function NavItem({ item, active }: { item: { to: string; icon: typeof MessageSquare; label: string; shortcut?: string | null }; active: boolean }) {
  return (
    <NavLink to={item.to} className={clsx(
      'flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all mb-0.5 group',
      active
        ? 'bg-primary-600/10 text-primary-400 shadow-sm shadow-primary-500/5'
        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
    )}>
      <item.icon size={16} className={active ? 'text-primary-400' : 'text-surface-500 group-hover:text-surface-300'} />
      <span className="flex-1">{item.label}</span>
      {item.shortcut && (
        <span className={clsx('text-[10px] font-mono px-1.5 py-0.5 rounded',
          active ? 'text-primary-400/60 bg-primary-500/10' : 'text-surface-600 bg-surface-800'
        )}>{item.shortcut}</span>
      )}
    </NavLink>
  );
}
