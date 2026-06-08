'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'complete';
  priority: 'low' | 'medium' | 'high';
}

const statusLabels: Record<TaskItem['status'], string> = {
  new: 'New',
  'in-progress': 'In progress',
  complete: 'Complete',
};

export function TaskManager() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskItem['priority']>('medium');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(console.error);
  }, []);

  const createTask = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority }),
      });
      if (!response.ok) throw new Error('Unable to create task');
      const created = await response.json();
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
        <CardDescription>Track priorities, status, and plan your day from the AI workspace.</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task title" />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as TaskItem['priority'])}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[96px] w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Describe the task and what the AI should keep in mind."
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Create tasks that AdvutAI can reference in chats.</span>
          <Button onClick={createTask} disabled={loading}>Add task</Button>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.description}</p>
                </div>
                <div className="space-x-2 text-sm text-slate-300">
                  <span>{statusLabels[task.status]}</span>
                  <span>•</span>
                  <span>{task.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
