import { motion } from "motion/react";

interface AtsGaugeProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export default function AtsGauge({ score, label, size = 180, strokeWidth = 14 }: AtsGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine elegant color themes based on score brackets
  let strokeColor = "stroke-rose-500";
  let textColor = "text-rose-500";
  let badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
  let rating = "Needs Work";

  if (score >= 80) {
    strokeColor = "stroke-emerald-500";
    textColor = "text-emerald-500";
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    rating = "Highly Optimized";
  } else if (score >= 60) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-500";
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    rating = "Moderate Fit";
  }

  return (
    <div id="ats-gauge-container" className="flex flex-col items-center justify-center p-5 glass rounded-2xl">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track circle (Background) */}
        <svg className="w-full h-full rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-800/80 fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Animated score circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-transparent ${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
          />
        </svg>

        {/* Core numerical display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-4xl font-black tracking-tight font-mono ${textColor}`}
          >
            {score}%
          </motion.span>
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider mt-0.5 text-center px-2">
            {label}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <span className={`badge border ${badgeColor}`}>
          {rating}
        </span>
      </div>
    </div>
  );
}
