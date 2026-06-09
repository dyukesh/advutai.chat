import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { MessageSquare, FolderKanban, SquareCheck as CheckSquare, Brain, Search, FileText, PenTool, Settings, CreditCard, ChartBar as BarChart3, Menu, LogOut, Sparkles, ChevronLeft, Users, Code as Code2, Image, Mic } from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/chat', icon: MessageSquare, label: 'Chat' },
  { to: '/code', icon: Code2, label: 'Code Assistant' },
  { to: '/workspace', icon: FolderKanban, label: 'Workspace' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/research', icon: Search, label: 'Research' },
  { to: '/files', icon: FileText, label: 'Files' },
  { to: '/content', icon: PenTool, label: 'Content Studio' },
  { to: '/image-gen', icon: Image, label: 'Images' },
  { to: '/voice', icon: Mic, label: 'Voice' },
  { to: '/team', icon: Users, label: 'Team' },
];

const BOTTOM_ITEMS = [
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/billing', icon: CreditCard, label: 'Billing' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout() {
  const { sidebarOpen, toggleSidebar, session, profile, signOut } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-surface-950 text-surface-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-surface-900 border-r border-surface-800 transition-all duration-250',
        sidebarOpen ? 'w-60' : 'w-0 -translate-x-full md:w-0'
      )}>
        {sidebarOpen && (
          <>
            <div className="flex items-center justify-between px-4 h-14 border-b border-surface-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight">AdvutAI</span>
              </div>
              <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
                <ChevronLeft size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                    isActive
                      ? 'bg-primary-600/15 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="my-3 border-t border-surface-800" />

              {BOTTOM_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                    isActive
                      ? 'bg-primary-600/15 text-primary-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-surface-800">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                  {(profile?.display_name || session?.user.email || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{profile?.display_name || 'User'}</p>
                  <p className="text-xs text-surface-500 truncate">{session?.user.email}</p>
                </div>
                <button
                  onClick={() => { signOut(); navigate('/login'); }}
                  className="p-1.5 rounded-md hover:bg-surface-800 text-surface-500 hover:text-error-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}

      {/* Main content */}
      <div className={clsx('flex-1 flex flex-col min-w-0', sidebarOpen && 'md:ml-60')}>
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 h-14 border-b border-surface-800 bg-surface-950/80 backdrop-blur-md sticky top-0 z-20">
          {!sidebarOpen && (
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
              <Menu size={20} />
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
