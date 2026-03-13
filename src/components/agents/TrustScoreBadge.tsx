'use client'

interface TrustScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { dimension: 48, strokeWidth: 3, fontSize: 'text-sm', radius: 18, labelSize: 'text-[10px]' },
  md: { dimension: 64, strokeWidth: 4, fontSize: 'text-lg', radius: 24, labelSize: 'text-xs' },
  lg: { dimension: 96, strokeWidth: 5, fontSize: 'text-2xl', radius: 38, labelSize: 'text-sm' },
} as const

function getScoreColor(score: number): string {
  if (score >= 80) return '#00c853'
  if (score >= 50) return '#f5a623'
  return '#ee0000'
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 50) return 'Good'
  if (score >= 30) return 'Fair'
  return 'Poor'
}

export default function TrustScoreBadge({ score, size = 'md' }: TrustScoreBadgeProps) {
  const config = sizeConfig[size]
  const color = getScoreColor(score)
  const label = getScoreLabel(score)
  const circumference = 2 * Math.PI * config.radius
  const progress = (score / 100) * circumference
  const center = config.dimension / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg
          width={config.dimension}
          height={config.dimension}
          viewBox={`0 0 ${config.dimension} ${config.dimension}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="var(--c3)"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${config.fontSize} font-bold tabular-nums`} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      {/* Label below */}
      <span className="text-[10px] text-c5 uppercase tracking-[0.2em] font-medium font-mono" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
