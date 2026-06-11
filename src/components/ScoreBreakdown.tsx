import { Briefcase, Code, GraduationCap, LayoutGrid } from "lucide-react";
import { SectionScores } from "../types";
import { motion } from "motion/react";

interface ScoreBreakdownProps {
  scores: SectionScores;
}

export default function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const categories = [
    {
      key: "experience",
      label: "Work Experience",
      score: scores.experience,
      icon: Briefcase,
      color: "bg-sky-500",
      textColor: "text-sky-400",
      description: "Impact statements, quantifiable metrics, and active verbs."
    },
    {
      key: "skills",
      label: "Keyword & Skills",
      score: scores.skills,
      icon: Code,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      description: "Match percentage across tech stacks and professional keywords."
    },
    {
      key: "education",
      label: "Education & Certs",
      score: scores.education,
      icon: GraduationCap,
      color: "bg-amber-500",
      textColor: "text-amber-400",
      description: "Institutional alignment, graduation years, and credential health."
    },
    {
      key: "formatting",
      label: "Structure & Format",
      score: scores.formatting,
      icon: LayoutGrid,
      color: "bg-sky-600",
      textColor: "text-sky-350",
      description: "Standard layout readable by search parsers, contact detail correctness."
    }
  ];

  // Helper to resolve score tag
  const getQualityLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", textClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/35" };
    if (score >= 60) return { label: "Standard", textClass: "text-amber-400 bg-amber-500/10 border-amber-500/35" };
    return { label: "Weak", textClass: "text-rose-400 bg-rose-500/10 border-rose-500/35" };
  };

  return (
    <div id="score-breakdown-panel" className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <LayoutGrid className="w-5 h-5 text-sky-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          Role Compatibility Matrix
        </h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          const status = getQualityLabel(cat.score);

          return (
            <div
              id={`metric-item-${cat.key}`}
              key={cat.key}
              className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded bg-slate-800 border border-slate-705 ${cat.textColor}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {cat.label}
                  </span>
                </div>
                
                <span className={`badge border ${status.textClass}`}>
                  {status.label}
                </span>
              </div>

              {/* Score text */}
              <div className="flex items-baseline gap-1 mt-1 mb-2">
                <span className="text-2xl font-bold text-white">
                  {cat.score}%
                </span>
                <span className="text-3xs text-slate-500 font-mono">Index Score</span>
              </div>

              {/* Custom linear animated progress track */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div
                  className={`h-full ${cat.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
