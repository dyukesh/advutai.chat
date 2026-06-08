'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function VoiceControl() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event: any) => {
      const transcriptText = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setTranscript(transcriptText);
    };

    recognitionInstance.onerror = () => {
      setError('Speech recognition failed.');
      setListening(false);
    };

    recognitionInstance.onend = () => {
      setListening(false);
    };

    setRecognition(recognitionInstance);
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      setTranscript('');
      setError('');
      recognition.start();
      setListening(true);
    }
  };

  const speak = () => {
    if (!window.speechSynthesis) {
      setError('Text-to-speech is not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(voiceMessage || transcript || 'Hello from AdvutAI.');
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice AI</CardTitle>
        <CardDescription>Use speech input and AI voice output for a hands-free workflow.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="font-medium text-white">Transcript</p>
          <p className="mt-2 whitespace-pre-wrap">{transcript || 'No speech detected yet.'}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button onClick={toggleListening} variant={listening ? 'secondary' : 'default'}>
            {listening ? 'Stop Listening' : 'Push to Talk'}
          </Button>
          <Button onClick={speak} variant="secondary">Speak Text</Button>
        </div>
        <div>
          <textarea
            value={voiceMessage}
            onChange={(event) => setVoiceMessage(event.target.value)}
            className="min-h-[96px] w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Enter text for AI voice output"
          />
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      </div>
    </Card>
  );
}
