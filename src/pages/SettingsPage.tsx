import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { User, Bell, Shield, Palette, Globe, Save, Key, Eye, EyeOff, CircleCheck as CheckCircle, Circle as XCircle, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const SECTIONS = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe },
];

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-surface-100">{title}</h3>
      <p className="text-[13px] text-surface-500 mt-0.5">{desc}</p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">{children}</div>;
}

function ApiKeysSection() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key') ?? '';
    setOpenaiKey(stored);
  }, []);

  const handleSave = () => {
    if (openaiKey.trim()) {
      localStorage.setItem('openai_api_key', openaiKey.trim());
    } else {
      localStorage.removeItem('openai_api_key');
    }
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    const key = openaiKey.trim();
    if (!key) { setTestResult({ ok: false, msg: 'Enter an API key first' }); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.ok) {
        setTestResult({ ok: true, msg: 'API key is valid and working!' });
      } else {
        const d = await res.json();
        setTestResult({ ok: false, msg: d?.error?.message ?? `Error ${res.status}` });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error — check your connection' });
    } finally {
      setTesting(false);
    }
  };

  const hasKey = Boolean(localStorage.getItem('openai_api_key'));

  return (
    <div className="space-y-4">
      <SectionHeader
        title="API Keys"
        desc="Add your own API keys to unlock real AI responses. Keys are stored locally in your browser."
      />

      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-[13px] font-semibold text-surface-200">OpenAI API Key</h4>
              {hasKey && (
                <span className="text-[10px] font-medium text-success-400 bg-success-500/10 px-2 py-0.5 rounded-full border border-success-500/20">
                  Configured
                </span>
              )}
            </div>
            <p className="text-[12px] text-surface-500">Powers Chat (GPT-4o, GPT-4o Mini) and Code Assistant</p>
          </div>
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap">
            Get key <ExternalLink size={11} />
          </a>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2.5 text-[13px] text-surface-200 placeholder-surface-600 focus:border-primary-500/60 focus:bg-surface-800 outline-none transition-all font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
            >
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {testResult && (
            <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]',
              testResult.ok ? 'bg-success-500/10 border border-success-500/20 text-success-300' : 'bg-error-500/10 border border-error-500/20 text-error-300'
            )}>
              {testResult.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {testResult.msg}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[13px] font-medium transition-colors"
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Key'}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Key'}
            </button>
            {openaiKey && (
              <button
                onClick={() => { setOpenaiKey(''); localStorage.removeItem('openai_api_key'); setTestResult(null); }}
                className="px-4 py-2 text-error-400 hover:bg-error-500/10 rounded-lg text-[13px] transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-surface-800">
          <p className="text-[11px] text-surface-600 leading-relaxed">
            🔒 Your API key is stored in your browser's local storage only — it is never sent to our servers except directly to OpenAI when you send a message. Make sure your key has billing credits at{' '}
            <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              platform.openai.com/usage
            </a>.
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-[13px] font-semibold text-surface-200 mb-0.5">Anthropic (Claude)</h4>
            <p className="text-[12px] text-surface-500">Claude 4 Sonnet, Claude 4 Opus — coming soon</p>
          </div>
          <span className="text-[10px] text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full whitespace-nowrap">Coming soon</span>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-[13px] font-semibold text-surface-200 mb-0.5">Google (Gemini)</h4>
            <p className="text-[12px] text-surface-500">Gemini 2.5 Pro, Gemini 2.5 Flash — coming soon</p>
          </div>
          <span className="text-[10px] text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full whitespace-nowrap">Coming soon</span>
        </div>
      </Card>
    </div>
  );
}

export function SettingsPage() {
  const { profile, updateProfile, session } = useAppStore();
  const [activeSection, setActiveSection] = useState('api-keys');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName, bio });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-48 border-r border-surface-800 bg-surface-900/50 p-3 shrink-0">
        <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest px-2 mb-2">Settings</p>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={clsx(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium mb-0.5 transition-colors text-left',
              activeSection === s.id
                ? 'bg-surface-800 text-surface-100'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/40'
            )}
          >
            <s.icon size={14} className={activeSection === s.id ? 'text-primary-400' : 'text-surface-500'} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">

          {activeSection === 'api-keys' && <ApiKeysSection />}

          {activeSection === 'profile' && (
            <div className="space-y-4">
              <SectionHeader title="Profile" desc="Update your display name and bio." />
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Display Name</label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-[13px] text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500/60 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Email</label>
                    <input value={session?.user?.email ?? ''} disabled
                      className="w-full bg-surface-800/40 border border-surface-700/50 rounded-lg px-3 py-2 text-[13px] text-surface-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Bio</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-[13px] text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500/60 transition-colors resize-none" />
                  </div>
                  <button onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[13px] font-medium transition-colors">
                    <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <SectionHeader title="Appearance" desc="Customize the look and feel." />
              <Card>
                <label className="block text-[12px] font-medium text-surface-400 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Dark', 'Light', 'System'].map(t => (
                    <div key={t} className={clsx(
                      'p-3 rounded-xl border cursor-pointer transition-colors text-center',
                      t === 'Dark' ? 'border-primary-500/60 bg-primary-600/10' : 'border-surface-700 bg-surface-800 opacity-50'
                    )}>
                      <p className="text-[13px] font-medium text-surface-200">{t}</p>
                      <p className="text-[11px] text-surface-500 mt-0.5">{t === 'Dark' ? 'Active' : 'Soon'}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <SectionHeader title="Notifications" desc="Control what alerts you receive." />
              <Card>
                <div className="space-y-1">
                  {['Email notifications', 'Research completed', 'Task reminders', 'Team updates'].map(n => (
                    <div key={n} className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0">
                      <span className="text-[13px] text-surface-300">{n}</span>
                      <div className="w-9 h-5 bg-surface-700 rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-surface-500 rounded-full transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <SectionHeader title="Security" desc="Manage your account security settings." />
              <div className="space-y-3">
                {[
                  { title: 'Change Password', desc: 'Update your account password', btn: 'Change Password' },
                  { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', btn: 'Enable 2FA' },
                ].map(item => (
                  <Card key={item.title}>
                    <h4 className="text-[13px] font-semibold text-surface-200 mb-1">{item.title}</h4>
                    <p className="text-[12px] text-surface-500 mb-3">{item.desc}</p>
                    <button className="px-3 py-1.5 bg-surface-800 text-surface-300 text-[13px] rounded-lg hover:bg-surface-700 transition-colors">{item.btn}</button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div>
              <SectionHeader title="Language & Region" desc="Set your preferred language." />
              <Card>
                <label className="block text-[12px] font-medium text-surface-400 mb-1.5">Language</label>
                <select className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-[13px] text-surface-200 outline-none focus:border-primary-500/60">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Japanese</option>
                </select>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
