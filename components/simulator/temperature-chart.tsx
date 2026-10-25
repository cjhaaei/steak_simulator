'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { Pause, Play } from 'lucide-react'
import type { SimulationParams, SimulationResult } from '@/lib/steak-simulation'
import { formatClock, getStages } from '@/lib/steak-display'

interface TemperatureChartProps {
  params: SimulationParams
  result: SimulationResult
  currentTime: number
  isPlaying: boolean
  onScrub: (timeSec: number) => void
  onTogglePlay: () => void
}

const SERIES = [
  { key: 'surfaceTemp', label: '표면', color: '#f43f5e' },
  { key: 'quarterTemp', label: '1/4 깊이', color: '#f59e0b' },
  { key: 'coreTemp', label: '심부', color: '#f4f4f5' },
] as const

function ChartTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload?.length) return null
  const phase = (payload[0].payload as { phase: string }).phase
  return (
    <div className="min-w-40 rounded-lg border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-xl backdrop-blur">
      <div className="mb-1.5 flex items-center justify-between gap-4 border-b border-zinc-800 pb-1.5">
        <span className="font-mono text-xs text-zinc-400">{formatClock(Number(label))}</span>
        <span className="text-xs text-amber-400">{phase}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {SERIES.map((s) => {
          const item = payload.find((p) => p.dataKey === s.key)
          return (
            <li key={s.key} className="flex items-center justify-between gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                {s.label}
              </span>
              <span className="font-mono tabular-nums text-zinc-100">{Number(item?.value ?? 0).toFixed(1)}°C</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function TemperatureChart({ params, result, currentTime, isPlaying, onScrub, onTogglePlay }: TemperatureChartProps) {
  const handleChartPointer = (state: { activeLabel?: string | number } | null | undefined) => {
    const label = state?.activeLabel
    if (label === undefined || label === null) return
    const t = Number(label)
    if (Number.isFinite(t)) onScrub(t)
  }
  const currentPhase =
    getStages(params).find((s) => s.duration > 0 && currentTime > s.start && currentTime <= s.end)?.name ??
    getStages(params)[0].name
  const stages = getStages(params).filter((s) => s.duration > 0)
  const totalSec = stages.at(-1)?.end ?? 0
  const tickStep = totalSec > 2400 ? 600 : totalSec > 1200 ? 300 : totalSec > 600 ? 120 : 60
  const ticks = Array.from({ length: Math.floor(totalSec / tickStep) + 1 }, (_, i) => i * tickStep)

  return (
    <section aria-labelledby="chart-title" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="chart-title" className="text-base font-semibold text-zinc-50">
            시간-온도 곡선
          </h2>
          <p className="text-xs text-zinc-500">{`총 ${formatClock(totalSec)} · 5초 간격 샘플링`}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-4" aria-label="범례">
          {SERIES.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      </header>

      <div className="h-80 w-full" role="img" aria-label="표면, 1/4 깊이, 심부 온도의 시간에 따른 변화 그래프">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={result.timeSeries}
            margin={{ top: 24, right: 8, bottom: 0, left: -12 }}
            onMouseMove={handleChartPointer}
            onClick={handleChartPointer}
            className="cursor-crosshair"
          >
            {stages.map((stage) => (
              <ReferenceArea
                key={stage.name}
                x1={stage.start}
                x2={stage.end}
                fill={stage.isCooking ? '#f43f5e' : '#71717a'}
                fillOpacity={stage.isCooking ? 0.08 : 0.04}
                strokeOpacity={0}
                label={{
                  value: stage.name,
                  position: 'insideTop',
                  fill: stage.isCooking ? '#fb7185' : '#a1a1aa',
                  fontSize: 11,
                  offset: -18,
                }}
              />
            ))}
            <CartesianGrid stroke="#27272a" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="timeSec"
              type="number"
              domain={[0, totalSec]}
              ticks={ticks}
              tickFormatter={formatClock}
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
              tickLine={false}
            />
            <YAxis
              stroke="#52525b"
              tick={{ fill: '#a1a1aa', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}
              tickLine={false}
              axisLine={false}
              unit="°"
              domain={[0, 'auto']}
            />
            <ReferenceLine
              y={55}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: '55° MR', position: 'insideBottomLeft', fill: '#f59e0b', fontSize: 10 }}
            />
            <ReferenceLine
              y={60}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
              label={{ value: '60° Gray', position: 'insideTopLeft', fill: '#fb7185', fontSize: 10 }}
            />
            <ReferenceLine x={currentTime} stroke="#fbbf24" strokeWidth={1.5} ifOverflow="extendDomain" />
            <Tooltip content={(props) => <ChartTooltip {...(props as TooltipContentProps<number, string>)} />} cursor={{ stroke: '#52525b' }} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={s.key === 'coreTemp' ? 2.5 : 1.75}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? '재생 일시정지' : '시간 흐름 재생'}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-zinc-950 transition-colors hover:bg-amber-400"
        >
          {isPlaying ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px" aria-hidden="true" />}
        </button>
        <label className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="sr-only">시뮬레이션 시점</span>
          <input
            type="range"
            min={0}
            max={totalSec}
            step={5}
            value={currentTime}
            onChange={(e) => onScrub(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </label>
        <div className="flex shrink-0 flex-col items-end font-mono text-xs tabular-nums">
          <span className="text-zinc-100">{`${formatClock(currentTime)} / ${formatClock(totalSec)}`}</span>
          <span className="text-amber-400">{currentPhase}</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        그래프 위에 마우스를 올리거나 슬라이더를 움직이면 아래 단면 프로파일이 해당 시점으로 바뀝니다.
      </p>
    </section>
  )
}
