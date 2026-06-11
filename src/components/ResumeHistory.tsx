import { Calendar, Trash2, ChevronRight, FileText, Briefcase } from "lucide-react";
import { AnalysisHistoryItem } from "../types";

interface ResumeHistoryProps {
  history: AnalysisHistoryItem[];
  selectedId: string | null;
  onSelect: (item: AnalysisHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ResumeHistory({
  history,
  selectedId,
  onSelect,
  onDelete,
  onClearAll
}: ResumeHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div id="empty-history" className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
        <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
        <p className="text-xs font-medium">No previous scans found</p>
        <p className="text-[10px] text-slate-600 mt-1">Evaluated items will automatically persist locally here.</p>
      </div>
    );
  }

  return (
    <div id="resume-history-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          Saved Scans ({history.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-xxs text-rose-400 hover:text-rose-300 transition-colors font-semibold font-mono tracking-wider uppercase bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-y-auto max-h-[350px] space-y-2.5 pr-2 scrollbar-thin">
        {history.map((item) => {
          const isSelected = item.id === selectedId;
          const formattedDate = new Date(item.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div
              id={`history-item-${item.id}`}
              key={item.id}
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-sky-500/10 border-sky-500/40 shadow-inner"
                  : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/70 hover:border-slate-650"
              }`}
              onClick={() => onSelect(item)}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                  <p className="text-xs font-bold truncate text-slate-200">
                    {item.fileName}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-mono">
                  {item.analysis.candidateInfo?.name && item.analysis.candidateInfo.name !== "Unknown" && (
                    <span className="text-sky-305 text-sky-300 font-semibold">{item.analysis.candidateInfo.name}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formattedDate}
                  </span>
                  {item.jobDescriptionUsed ? (
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <Briefcase className="w-3 h-3 text-emerald-500/80" />
                      Matched
                    </span>
                  ) : (
                    <span className="text-slate-500">General Check</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-100 flex items-center justify-end gap-1">
                    <span className="text-[9px] text-slate-500 font-normal">Score:</span>
                    {item.analysis.atsScore}%
                  </div>
                  {item.jobDescriptionUsed && item.analysis.matchScore > 0 && (
                    <div className="text-[10px] font-semibold text-sky-400">
                      Match: {item.analysis.matchScore}%
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded text-slate-550 text-slate-500 hover:text-rose-400 transition-all duration-150"
                  title="Delete scan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
