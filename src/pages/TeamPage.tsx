import { Users, Shield, CreditCard as Edit3, Eye, UserPlus } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'You', email: 'you@advutai.com', role: 'owner' as const, avatar: 'Y' },
];

const ROLES = [
  { id: 'owner', label: 'Owner', icon: Shield, color: 'text-warning-400', desc: 'Full access and billing' },
  { id: 'admin', label: 'Admin', icon: Shield, color: 'text-primary-400', desc: 'Manage members and content' },
  { id: 'editor', label: 'Editor', icon: Edit3, color: 'text-success-400', desc: 'Create and edit content' },
  { id: 'viewer', label: 'Viewer', icon: Eye, color: 'text-surface-400', desc: 'View only access' },
];

export function TeamPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
          <Users size={20} className="text-primary-400" /> Team
        </h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={14} /> Invite Member
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Team members */}
          <div>
            <h3 className="text-sm font-semibold text-surface-300 mb-3">Members</h3>
            <div className="space-y-2">
              {TEAM_MEMBERS.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-surface-900 border border-surface-800 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200">{m.name}</p>
                    <p className="text-xs text-surface-500">{m.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning-500/10 text-warning-400 capitalize">{m.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Roles explanation */}
          <div>
            <h3 className="text-sm font-semibold text-surface-300 mb-3">Roles & Permissions</h3>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(r => (
                <div key={r.id} className="flex items-start gap-3 p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <r.icon size={18} className={r.color + ' mt-0.5'} />
                  <div>
                    <p className="text-sm font-medium text-surface-200 capitalize">{r.label}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
