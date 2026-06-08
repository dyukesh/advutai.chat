'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileEntry {
  id: string;
  name: string;
  type: string;
  size: number;
  summary: string | null;
}

export function FileWorkspace() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/files')
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch(console.error);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Select a file before upload.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const created = await res.json();
      setFiles((prev) => [created, ...prev]);
      setSelectedFile(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Intelligence</CardTitle>
        <CardDescription>Upload documents and let AdvutAI summarize and retrieve key insights.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="block rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <span className="text-sm text-slate-300">Upload PDF, DOCX, TXT, or image</span>
            <Input
              type="file"
              className="mt-3 h-auto cursor-pointer border-none bg-transparent px-0 pt-0"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <Button onClick={handleUpload} disabled={loading || !selectedFile}>Upload</Button>
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{file.type} · {(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {file.summary ? <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Summarized</span> : null}
              </div>
              {file.summary ? <p className="mt-3 text-sm leading-6 text-slate-300">{file.summary}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
