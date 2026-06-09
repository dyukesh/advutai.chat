import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { FolderKanban, Plus, Trash2, FileText, Code, StickyNote, Search as SearchIcon, Lightbulb } from 'lucide-react';
import clsx from 'clsx';

const ITEM_ICONS: Record<string, typeof FileText> = { document: FileText, prompt: Lightbulb, note: StickyNote, research: SearchIcon, code: Code, image: FileText };

export function WorkspacePage() {
  const { projects, loadProjects, createProject, deleteProject } = useAppStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject({ name: newProjectName.trim() });
    setNewProjectName('');
    setShowNewProject(false);
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="flex h-full">
      {/* Project list */}
      <div className="w-72 border-r border-surface-800 flex flex-col bg-surface-900">
        <div className="p-3">
          <button onClick={() => setShowNewProject(true)} className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> New Project
          </button>
        </div>
        {showNewProject && (
          <div className="px-3 pb-3">
            <div className="flex gap-2">
              <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateProject()}
                placeholder="Project name" className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500" />
              <button onClick={handleCreateProject} className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg">Create</button>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-2">
          {projects.map(p => (
            <div key={p.id} onClick={() => setSelectedProject(p.id)}
              className={clsx('group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors mb-0.5',
                selectedProject === p.id ? 'bg-surface-800 text-surface-100' : 'text-surface-400 hover:bg-surface-800/50 hover:text-surface-200'
              )}>
              <FolderKanban size={16} style={{ color: p.color }} />
              <span className="flex-1 text-sm truncate">{p.name}</span>
              <button onClick={e => { e.stopPropagation(); deleteProject(p.id); if (selectedProject === p.id) setSelectedProject(null); }}
                className="hidden group-hover:block p-1 rounded hover:bg-surface-700 text-surface-500 hover:text-error-400">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentProject ? (
          <>
            <div className="px-6 py-4 border-b border-surface-800">
              <div className="flex items-center gap-3">
                <FolderKanban size={20} style={{ color: currentProject.color }} />
                <h2 className="text-lg font-semibold text-surface-100">{currentProject.name}</h2>
                {currentProject.description && <p className="text-sm text-surface-400 ml-2">{currentProject.description}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['document', 'prompt', 'note', 'research', 'code'].map(type => {
                  const Icon = ITEM_ICONS[type] || FileText;
                  return (
                    <div key={type} className="flex flex-col gap-2 p-4 bg-surface-900 border border-surface-800 rounded-xl hover:border-surface-700 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 text-surface-300">
                        <Icon size={16} className="text-primary-400" />
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </div>
                      <p className="text-xs text-surface-500">Click to create a new {type}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderKanban size={48} className="mx-auto text-surface-700 mb-4" />
              <h3 className="text-lg font-semibold text-surface-300 mb-1">No project selected</h3>
              <p className="text-sm text-surface-500">Select a project from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
