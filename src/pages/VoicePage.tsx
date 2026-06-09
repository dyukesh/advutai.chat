import { useState, useRef } from 'react';
import { Mic, Volume2, Upload, Play, Pause, Square, MicOff } from 'lucide-react';
import clsx from 'clsx';

const VOICES = ['Alloy', 'Echo', 'Fable', 'Onyx', 'Nova', 'Shimmer'];

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Alloy');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'stt' | 'tts' | 'conversation'>('stt');
  const [conversationMessages, setConversationMessages] = useState<{ role: string; content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setTranscription('This is a simulated transcription of your voice input. In production, this would use Whisper or a similar speech-to-text service to convert your audio to text in real-time.');
        if (activeTab === 'conversation') {
          setConversationMessages(prev => [...prev, { role: 'user', content: 'Simulated voice input transcription' }]);
          setTimeout(() => {
            setConversationMessages(prev => [...prev, { role: 'assistant', content: 'I received your voice message. In production, I would process your speech input and respond with both text and synthesized voice output.' }]);
          }, 1000);
        }
      }, 2000);
    }
  };

  const handleSpeak = () => {
    if (!ttsText.trim()) return;
    setIsSpeaking(true);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-surface-800 flex flex-col bg-surface-900">
        <div className="p-3">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Voice Features</h3>
          {([['stt', Mic, 'Speech to Text'], ['tts', Volume2, 'Text to Speech'], ['conversation', Mic, 'Voice Chat']] as const).map(([tab, Icon, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={clsx('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                activeTab === tab ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              )}>
              <Icon size={14} className="text-primary-400" /> {label}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-surface-800">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Voice</h3>
          <div className="grid grid-cols-2 gap-1">
            {VOICES.map(v => (
              <button key={v} onClick={() => setSelectedVoice(v)}
                className={clsx('px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  selectedVoice === v ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:text-surface-200'
                )}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-surface-800">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upload Audio</h3>
          <button onClick={handleFileUpload} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-surface-200 rounded-lg text-sm transition-colors">
            <Upload size={14} /> Upload File
          </button>
          <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" />
          <p className="text-xs text-surface-600 mt-2">Supports MP3, WAV, M4A, WebM</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-4 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
            {activeTab === 'stt' && <><Mic size={20} className="text-primary-400" /> Speech to Text</>}
            {activeTab === 'tts' && <><Volume2 size={20} className="text-primary-400" /> Text to Speech</>}
            {activeTab === 'conversation' && <><Mic size={20} className="text-primary-400" /> Voice Conversation</>}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'stt' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center py-8">
                  <button onClick={toggleRecording}
                    className={clsx('w-20 h-20 rounded-full flex items-center justify-center transition-all',
                      isRecording ? 'bg-error-500 animate-pulse-glow scale-110' : 'bg-primary-600 hover:bg-primary-500 hover:scale-105'
                    )}>
                    {isRecording ? <Square size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
                  </button>
                  <p className="mt-3 text-sm text-surface-400">{isRecording ? 'Recording... Click to stop' : 'Click to start recording'}</p>
                </div>

                {transcription && (
                  <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-surface-300 mb-2">Transcription</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{transcription}</p>
                    <button onClick={() => navigator.clipboard.writeText(transcription)} className="mt-3 text-xs text-primary-400 hover:text-primary-300">Copy transcription</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tts' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-2">Text to Speak</label>
                  <textarea value={ttsText} onChange={e => setTtsText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    className="w-full bg-surface-900 border border-surface-800 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 resize-none h-40" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSpeak} disabled={!ttsText.trim() || isSpeaking}
                    className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isSpeaking ? 'bg-warning-500/20 text-warning-400' : 'bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white'
                    )}>
                    {isSpeaking ? <><Pause size={16} /> Speaking...</> : <><Play size={16} /> Speak</>}
                  </button>
                  {isSpeaking && (
                    <button onClick={() => { speechSynthesis.cancel(); setIsSpeaking(false); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-surface-800 text-surface-400 rounded-lg text-sm hover:text-surface-200">
                      <Square size={16} /> Stop
                    </button>
                  )}
                </div>
                <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
                  <p className="text-xs text-surface-500">Voice: <span className="text-surface-300">{selectedVoice}</span></p>
                  <p className="text-xs text-surface-500 mt-1">Uses browser Speech Synthesis API. Production would use neural TTS for natural-sounding output.</p>
                </div>
              </div>
            )}

            {activeTab === 'conversation' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {conversationMessages.length === 0 && (
                    <div className="text-center py-8">
                      <MicOff size={32} className="mx-auto text-surface-700 mb-3" />
                      <p className="text-surface-400 text-sm">Start a voice conversation by clicking the microphone</p>
                    </div>
                  )}
                  {conversationMessages.map((msg, i) => (
                    <div key={i} className={clsx('flex gap-3 animate-fade-in', msg.role === 'user' && 'flex-row-reverse')}>
                      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-surface-800 text-primary-400 border border-surface-700'
                      )}>
                        {msg.role === 'user' ? <Mic size={14} /> : <Volume2 size={14} />}
                      </div>
                      <div className={clsx('max-w-[80%] rounded-xl px-4 py-3 text-sm',
                        msg.role === 'user' ? 'bg-primary-700 text-white' : 'bg-surface-900 border border-surface-800 text-surface-300'
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button onClick={toggleRecording}
                    className={clsx('w-16 h-16 rounded-full flex items-center justify-center transition-all',
                      isRecording ? 'bg-error-500 animate-pulse-glow scale-110' : 'bg-primary-600 hover:bg-primary-500 hover:scale-105'
                    )}>
                    {isRecording ? <Square size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
