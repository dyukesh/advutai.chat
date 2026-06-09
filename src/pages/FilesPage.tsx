import { useState } from 'react';
import { FileText, Upload, File, Image, Table, FileCode, Search, FolderKanban } from 'lucide-react';
import clsx from 'clsx';

const FILE_TYPES = [
  { icon: FileText, label: 'PDF', extensions: ['.pdf'], color: 'text-error-400' },
  { icon: FileText, label: 'DOCX', extensions: ['.docx'], color: 'text-primary-400' },
  { icon: File, label: 'TXT', extensions: ['.txt', '.md'], color: 'text-surface-400' },
  { icon: Table, label: 'CSV/XLSX', extensions: ['.csv', '.xlsx'], color: 'text-success-400' },
  { icon: Image, label: 'Images', extensions: ['.png', '.jpg', '.gif', '.webp'], color: 'text-warning-400' },
  { icon: FileCode, label: 'Code', extensions: ['.js', '.ts', '.py', '.html'], color: 'text-accent-400' },
];

export function FilesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      {/* Type sidebar */}
      <div className="w-56 border-r border-surface-800 flex flex-col bg-surface-900 p-3">
        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-2 mb-2">File Types</h3>
        <button onClick={() => setFilterType(null)}
          className={clsx('flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-colors',
            !filterType ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
          )}>
          <FolderKanban size={14} /> All Files
        </button>
        {FILE_TYPES.map(ft => (
          <button key={ft.label} onClick={() => setFilterType(ft.label)}
            className={clsx('flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm mb-0.5 transition-colors',
              filterType === ft.label ? 'bg-surface-800 text-surface-200' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
            )}>
            <ft.icon size={14} className={ft.color} /> {ft.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-surface-100">Files</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files..." className="bg-surface-800 border border-surface-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500 w-56" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Upload size={14} /> Upload
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className="text-surface-600" />
            </div>
            <h3 className="text-lg font-semibold text-surface-300 mb-1">Upload files to analyze</h3>
            <p className="text-sm text-surface-500 mb-4 max-w-sm">Drag and drop files or click upload. Supported: PDF, DOCX, TXT, CSV, XLSX, Images, Markdown</p>
            <div className="flex flex-wrap justify-center gap-2">
              {FILE_TYPES.map(ft => (
                <span key={ft.label} className={clsx('text-xs px-2 py-1 rounded-lg bg-surface-800', ft.color)}>{ft.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
