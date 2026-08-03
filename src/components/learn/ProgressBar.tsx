"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  variant?: "linear" | "circular";
}

export default function ProgressBar({
  progress,
  size = "md",
  showLabel = true,
  label,
  variant = "linear",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  if (variant === "circular") {
    const sizeMap = { sm: 48, md: 72, lg: 96 };
    const strokeMap = { sm: 4, md: 5, lg: 6 };
    const fontMap = { sm: "text-xs", md: "text-sm", lg: "text-lg" };
    const diameter = sizeMap[size];
    const strokeWidth = strokeMap[size];
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: diameter, height: diameter }}>
          <svg className="transform -rotate-90" width={diameter} height={diameter}>
            {/* Background circle */}
            <circle
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-surface-200 dark:text-surface-700"
            />
            {/* Progress circle */}
            <circle
              cx={diameter / 2}
              cy={diameter / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-primary-500 transition-all duration-700 ease-out"
              stroke="url(#progressGradient)"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary-500)" />
                <stop offset="100%" stopColor="var(--color-accent-500)" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center text */}
          <div className={`absolute inset-0 flex items-center justify-center font-bold ${fontMap[size]} text-surface-900 dark:text-white`}>
            {Math.round(clampedProgress)}%
          </div>
        </div>
        {showLabel && label && (
          <span className="text-xs text-surface-500 dark:text-surface-400">{label}</span>
        )}
      </div>
    );
  }

  // Linear variant
  const heightMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-surface-500 dark:text-surface-400">{label || "Progress"}</span>
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`${heightMap[size]} bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden`}>
        <div
          className={`${heightMap[size]} bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
