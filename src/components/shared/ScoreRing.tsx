import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreRing({ score, size = 'md', className }: ScoreRingProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  if (score >= 80) colorClass = "text-emerald-500";
  else if (score >= 65) colorClass = "text-amber-500";

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)} aria-label={`Match score: ${score} out of 100`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-gray-100 stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <motion.circle
          className={cn("stroke-current", colorClass)}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn("font-semibold text-blue-950", textClasses[size])}>{score}</span>
        {size !== 'sm' && <span className="text-sm text-gray-500">/100</span>}
      </div>
    </div>
  );
}
