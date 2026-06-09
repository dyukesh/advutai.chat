import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Search, FileText, Clock, CircleCheck as CheckCircle, Circle as XCircle, Loader as Loader2 } from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STATUS_ICON = {
  pending: Clock,
  researching: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

const STATUS_COLOR = {
  pending: 'text-surface-400',
  researching: 'text-primary-400',
  completed: 'text-success-400',
  failed: 'text-error-400',
};

export function ResearchPage() {
  const { researchReports, loadResearchReports, createResearchReport } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  useEffect(() => { loadResearchReports(); }, [loadResearchReports]);

  const handleResearch = async () => {
    if (!query.trim() || isResearching) return;
    setIsResearching(true);
    const id = await createResearchReport(query.trim());
    if (id) setSelectedReport(id);
    setQuery('');
    setIsResearching(false);
  };

  const currentReport = researchReports.find(r => r.id === selectedReport);

  return (
    <div className="flex h-full">
      {/* Report list */}
      <div className="w-80 border-r border-surface-800 flex flex-col bg-surface-900">
        <div className="p-3">
          <h3 className="text-sm font-semibold text-surface-300 mb-2 px-1">Research Reports</h3>
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleResearch()}
              placeholder="Research query..." className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-1.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-primary-500" />
            <button onClick={handleResearch} disabled={isResearching}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors flex items-center gap-1">
              {isResearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Research
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {researchReports.map(report => {
            const StatusIcon = STATUS_ICON[report.status];
            return (
              <div key={report.id} onClick={() => setSelectedReport(report.id)}
                className={clsx('flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5',
                  selectedReport === report.id ? 'bg-surface-800 text-surface-100' : 'text-surface-400 hover:bg-surface-800/50'
                )}>
                <StatusIcon size={14} className={clsx(STATUS_COLOR[report.status], report.status === 'researching' && 'animate-spin', 'mt-0.5 flex-shrink-0')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{report.title}</p>
                  <p className="text-xs text-surface-500 truncate">{report.query}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentReport ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-surface-50 mb-2">{currentReport.title}</h1>
              <p className="text-sm text-surface-400">Query: {currentReport.query}</p>
              <div className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2',
                STATUS_COLOR[currentReport.status], currentReport.status === 'completed' ? 'bg-success-500/10' : currentReport.status === 'failed' ? 'bg-error-500/10' : 'bg-primary-600/10'
              )}>
                {(() => { const I = STATUS_ICON[currentReport.status]; return <I size={12} className={currentReport.status === 'researching' ? 'animate-spin' : ''} />; })()}
                {currentReport.status.charAt(0).toUpperCase() + currentReport.status.slice(1)}
              </div>
            </div>

            {currentReport.summary && (
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-semibold text-surface-300 mb-3">Summary</h2>
                <div className="text-sm text-surface-400 leading-relaxed whitespace-pre-wrap">{currentReport.summary}</div>
              </div>
            )}

            {currentReport.sources && Array.isArray(currentReport.sources) && currentReport.sources.length > 0 && (
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-5 mb-6">
                <h2 className="text-sm font-semibold text-surface-300 mb-3">Sources</h2>
                <div className="space-y-2">
                  {(currentReport.sources as { title: string; url: string; type: string }[]).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText size={14} className="text-primary-400 flex-shrink-0" />
                      <span className="flex-1 text-surface-300">{s.title}</span>
                      <span className="text-xs text-surface-500 px-2 py-0.5 bg-surface-800 rounded">{s.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentReport.report_content && (
              <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentReport.report_content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Search size={48} className="mx-auto text-surface-700 mb-3" />
              <h3 className="text-lg font-semibold text-surface-300 mb-1">Deep Research</h3>
              <p className="text-sm text-surface-500">Enter a research query to generate a comprehensive report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
