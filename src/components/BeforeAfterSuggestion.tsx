import { CheckCircle, AlertTriangle, Lightbulb, ChevronRight } from "lucide-react";
import { ImprovementSuggestion } from "../types";

interface BeforeAfterSuggestionProps {
  suggestions: ImprovementSuggestion[];
}

export default function BeforeAfterSuggestion({ suggestions }: BeforeAfterSuggestionProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div id="no-suggestions" className="text-center py-6 text-slate-400 bg-slate-950/40 rounded-xl border border-slate-900">
        No specific updates recommended. Outstanding formatting detected!
      </div>
    );
  }

  return (
    <div id="before-after-suggestions-container" className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-slate-200">
          Professional Bullet Point Transformations
        </h3>
      </div>
      
      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        Recruiters and modern ATS software look for statement impact, strong active verbs, and specific metric milestones. 
        Below are tailored suggestions mapping your weak/passive formulations into highly optimized, high-conversion achievements.
      </p>

      <div className="grid gap-6">
        {suggestions.map((item, index) => (
          <div 
            id={`suggestion-card-${index}`} 
            key={index}
            className="flex flex-col bg-slate-905 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800/80 shadow-md hover:border-slate-700/80 transition-all duration-300 overflow-hidden"
          >
            {/* Header section tag */}
            <div className="px-4 py-2 bg-slate-900 flex items-center justify-between border-b border-slate-800/80">
              <span className="text-xxs font-extrabold uppercase tracking-widest text-indigo-400 font-mono">
                {item.section || "General Bullet Point"}
              </span>
              <span className="text-xs text-slate-500 font-medium">#{index + 1}</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Split view: Before vs After */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Before: Poorly Formatted / Passive */}
                <div className="flex flex-col p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Original / Passive Phrasing
                  </div>
                  <p className="text-slate-400 text-sm line-through italic font-mono bg-rose-950/20 px-2 py-1.5 rounded border border-rose-950/30">
                    "{item.before}"
                  </p>
                </div>

                {/* After: Polished / Quantifiable */}
                <div className="flex flex-col p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ATS & Recruiter-Ready Upgrade
                  </div>
                  <p className="text-slate-100 text-sm font-semibold font-mono bg-emerald-950/25 px-2 py-1.5 rounded border border-emerald-950/30">
                    "{item.after}"
                  </p>
                </div>
              </div>

              {/* Rationale explanation panel */}
              <div className="flex gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-400 font-semibold mr-1">ATS Optimization Strategy:</strong> 
                  {item.explanation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
