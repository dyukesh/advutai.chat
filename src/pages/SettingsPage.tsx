import { useState } from 'react';
import { useAppStore } from '../store';
import { User, Bell, Shield, Palette, Globe, Save } from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
];

export function SettingsPage() {
  const { profile, updateProfile, session } = useAppStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ display_name: displayName, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full">
      <div className="w-56 border-r border-surface-800 flex flex-col bg-surface-900 p-3">
        <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2 mb-2">Settings</h2>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-colors ${
              activeSection === s.id ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            }`}>
            <s.icon size={14} /> {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-100">Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Display Name</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                  <input value={session?.user.email || ''} disabled
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-24" />
                </div>
              </div>
              <button onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
                <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-100">Appearance</h3>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Dark', 'Light', 'System'].map(t => (
                    <div key={t} className={`p-4 rounded-xl border cursor-pointer transition-colors ${t === 'Dark' ? 'border-primary-500 bg-primary-600/10' : 'border-surface-700 bg-surface-800 hover:border-surface-600'}`}>
                      <p className="text-sm font-medium text-surface-200">{t}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{t === 'Dark' ? 'Currently active' : 'Coming soon'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-100">Notifications</h3>
              {['Email notifications', 'Research completed', 'Task reminders', 'Team updates'].map(n => (
                <div key={n} className="flex items-center justify-between py-3 border-b border-surface-800">
                  <span className="text-sm text-surface-300">{n}</span>
                  <div className="w-10 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-100">Security</h3>
              <div className="space-y-4">
                <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Change Password</h4>
                  <p className="text-xs text-surface-500 mb-3">Update your account password</p>
                  <button className="px-3 py-1.5 bg-surface-800 text-surface-300 text-sm rounded-lg hover:bg-surface-700 transition-colors">Change Password</button>
                </div>
                <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Two-Factor Authentication</h4>
                  <p className="text-xs text-surface-500 mb-3">Add an extra layer of security</p>
                  <button className="px-3 py-1.5 bg-surface-800 text-surface-300 text-sm rounded-lg hover:bg-surface-700 transition-colors">Enable 2FA</button>
                </div>
                <div className="p-4 bg-surface-900 border border-surface-800 rounded-xl">
                  <h4 className="text-sm font-medium text-surface-200 mb-1">Active Sessions</h4>
                  <p className="text-xs text-surface-500">1 active session</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-surface-100">Language & Region</h3>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Language</label>
                <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-200 outline-none focus:border-primary-500">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
