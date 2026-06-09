import { ChartBar as BarChart3, MessageSquare, Zap, HardDrive, Clock, TrendingUp, Users, DollarSign } from 'lucide-react';

const STATS = [
  { label: 'Total Messages', value: '0', icon: MessageSquare, color: 'text-primary-400', bg: 'bg-primary-600/10' },
  { label: 'Tokens Used', value: '0', icon: Zap, color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { label: 'Storage Used', value: '0 MB', icon: HardDrive, color: 'text-success-400', bg: 'bg-success-500/10' },
  { label: 'Active Time', value: '0h', icon: Clock, color: 'text-accent-400', bg: 'bg-primary-600/10' },
];

const CHART_DATA = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 0 },
  { label: 'Wed', value: 0 },
  { label: 'Thu', value: 0 },
  { label: 'Fri', value: 0 },
  { label: 'Sat', value: 0 },
  { label: 'Sun', value: 0 },
];

const FEATURES = [
  { name: 'Chat', usage: 0, limit: 50, unit: 'messages' },
  { name: 'Research', usage: 0, limit: 5, unit: 'reports' },
  { name: 'Content Studio', usage: 0, limit: 10, unit: 'generations' },
  { name: 'File Uploads', usage: 0, limit: 5, unit: 'files' },
];

export function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-surface-800">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary-400" /> Analytics
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-surface-900 border border-surface-800 rounded-xl p-4">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
                <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Activity chart */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-300">Weekly Activity</h3>
              <div className="flex items-center gap-1 text-xs text-surface-500">
                <TrendingUp size={12} /> Last 7 days
              </div>
            </div>
            <div className="flex items-end gap-3 h-40">
              {CHART_DATA.map(d => (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-surface-800 rounded-t-md relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full bg-primary-500/30 rounded-t-md" style={{ height: `${Math.max(d.value, 2)}%` }} />
                  </div>
                  <span className="text-xs text-surface-500">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature usage */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-surface-300 mb-4">Feature Usage</h3>
            <div className="space-y-4">
              {FEATURES.map(f => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-surface-300">{f.name}</span>
                    <span className="text-xs text-surface-500">{f.usage} / {f.limit} {f.unit}</span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-2">
                    <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${(f.usage / f.limit) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
              <Users size={20} className="mx-auto text-surface-600 mb-2" />
              <p className="text-lg font-semibold text-surface-200">1</p>
              <p className="text-xs text-surface-500">Team Members</p>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
              <DollarSign size={20} className="mx-auto text-surface-600 mb-2" />
              <p className="text-lg font-semibold text-surface-200">$0</p>
              <p className="text-xs text-surface-500">Monthly Spend</p>
            </div>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 text-center">
              <Zap size={20} className="mx-auto text-surface-600 mb-2" />
              <p className="text-lg font-semibold text-surface-200">0</p>
              <p className="text-xs text-surface-500">Tokens Today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
