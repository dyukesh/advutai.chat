import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import type { Task } from '../types';
import { Plus, Trash2, GripVertical, Calendar, Flag, LayoutGrid, List, CalendarDays, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<Task['status'], { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: 'text-surface-400', bg: 'bg-surface-800' },
  in_progress: { label: 'In Progress', color: 'text-primary-400', bg: 'bg-primary-600/10' },
  review: { label: 'Review', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  done: { label: 'Done', color: 'text-success-400', bg: 'bg-success-500/10' },
};

const PRIORITY_CONFIG: Record<Task['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-surface-500' },
  medium: { label: 'Medium', color: 'text-primary-400' },
  high: { label: 'High', color: 'text-warning-400' },
  urgent: { label: 'Urgent', color: 'text-error-400' },
};

export function TasksPage() {
  const { tasks, loadTasks, createTask, updateTask, deleteTask } = useAppStore();
  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle.trim(), status: 'todo', priority: 'medium' });
    setNewTitle('');
    setShowNewTask(false);
  };

  const handleAIPlan = async () => {
    await createTask({ title: 'Define project scope and objectives', status: 'todo', priority: 'high', ai_generated: true });
    await createTask({ title: 'Research and gather requirements', status: 'todo', priority: 'high', ai_generated: true });
    await createTask({ title: 'Create project timeline and milestones', status: 'todo', priority: 'medium', ai_generated: true });
    await createTask({ title: 'Assign team responsibilities', status: 'todo', priority: 'medium', ai_generated: true });
    await createTask({ title: 'Set up development environment', status: 'todo', priority: 'low', ai_generated: true });
    await createTask({ title: 'Review and approve plan', status: 'todo', priority: 'medium', ai_generated: true });
  };

  const statusOrder: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
        <h2 className="text-lg font-semibold text-surface-100">Tasks</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleAIPlan} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/10 text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-600/20 transition-colors">
            <Sparkles size={14} /> AI Plan
          </button>
          <div className="flex bg-surface-800 rounded-lg p-0.5">
            {([['kanban', LayoutGrid], ['list', List], ['calendar', CalendarDays]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)} className={clsx('p-1.5 rounded-md transition-colors', view === v ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300')}>
                <Icon size={16} />
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewTask(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={14} /> Add Task
          </button>
        </div>
      </div>

      {showNewTask && (
        <div className="px-6 py-3 border-b border-surface-800 bg-surface-900">
          <div className="flex gap-2">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Task title..." className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500" />
            <button onClick={handleCreate} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg">Add</button>
            <button onClick={() => setShowNewTask(false)} className="px-3 py-1.5 bg-surface-800 text-surface-400 text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-4 h-full">
            {statusOrder.map(status => {
              const config = STATUS_CONFIG[status];
              const columnTasks = tasks.filter(t => t.status === status);
              return (
                <div key={status} className="flex flex-col">
                  <div className={clsx('flex items-center justify-between px-3 py-2 rounded-t-xl', config.bg)}>
                    <span className={clsx('text-sm font-semibold', config.color)}>{config.label}</span>
                    <span className="text-xs text-surface-500">{columnTasks.length}</span>
                  </div>
                  <div className="flex-1 bg-surface-900/50 rounded-b-xl p-2 space-y-2 overflow-y-auto border border-surface-800 border-t-0">
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'list' && (
          <div className="max-w-3xl mx-auto space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 bg-surface-900 border border-surface-800 rounded-xl hover:border-surface-700 transition-colors">
                <button onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                  className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                    task.status === 'done' ? 'bg-success-500 border-success-500 text-white' : 'border-surface-600 hover:border-primary-400'
                  )}>
                  {task.status === 'done' && <span className="text-xs">✓</span>}
                </button>
                <span className={clsx('flex-1 text-sm', task.status === 'done' ? 'line-through text-surface-500' : 'text-surface-200')}>{task.title}</span>
                <span className={clsx('text-xs', PRIORITY_CONFIG[task.priority].color)}>{PRIORITY_CONFIG[task.priority].label}</span>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full', STATUS_CONFIG[task.status].bg, STATUS_CONFIG[task.status].color)}>{STATUS_CONFIG[task.status].label}</span>
                <button onClick={() => deleteTask(task.id)} className="p-1 rounded hover:bg-surface-800 text-surface-500 hover:text-error-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'calendar' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-surface-500 py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 2;
                  const date = new Date();
                  date.setDate(day);
                  const dayTasks = tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === date.toDateString());
                  return (
                    <div key={i} className={clsx('min-h-[80px] p-1.5 border border-surface-800 rounded-lg', day < 1 || day > 30 ? 'opacity-30' : '')}>
                      <span className="text-xs text-surface-500">{day > 0 && day <= 30 ? day : ''}</span>
                      {dayTasks.slice(0, 2).map(t => (
                        <div key={t.id} className="mt-0.5 text-xs text-primary-400 truncate bg-primary-600/10 px-1 rounded">{t.title}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdate, onDelete }: { task: Task; onUpdate: (id: string, updates: Partial<Task>) => void; onDelete: (id: string) => void }) {
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  const statuses = ['todo', 'in_progress', 'review', 'done'] as const;
  const nextStatus = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];

  return (
    <div className="group bg-surface-900 border border-surface-800 rounded-xl p-3 hover:border-surface-700 transition-colors">
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-surface-600 mt-0.5 cursor-grab flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-surface-200 font-medium truncate">{task.title}</p>
          {task.description && <p className="text-xs text-surface-500 mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <button onClick={() => onUpdate(task.id, { priority: priorities[(priorities.indexOf(task.priority) + 1) % priorities.length] })}
              className="flex items-center gap-1 text-xs">
              <Flag size={10} className={PRIORITY_CONFIG[task.priority].color} />
              <span className={PRIORITY_CONFIG[task.priority].color}>{PRIORITY_CONFIG[task.priority].label}</span>
            </button>
            {task.due_date && (
              <span className="flex items-center gap-1 text-xs text-surface-500">
                <Calendar size={10} /> {format(new Date(task.due_date), 'MMM d')}
              </span>
            )}
            {task.ai_generated && <span className="text-xs text-primary-400 font-medium">AI</span>}
          </div>
        </div>
      </div>
      <div className="hidden group-hover:flex items-center gap-1 mt-2 pt-2 border-t border-surface-800">
        <button onClick={() => onUpdate(task.id, { status: nextStatus })} className="text-xs text-surface-400 hover:text-primary-400">Move →</button>
        <button onClick={() => onDelete(task.id)} className="text-xs text-surface-400 hover:text-error-400 ml-auto">Delete</button>
      </div>
    </div>
  );
}
