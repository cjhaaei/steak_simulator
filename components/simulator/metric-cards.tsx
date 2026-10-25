import type { SimulationResult } from '@/lib/steak-simulation'
import { tempToColor, type Locale } from '@/lib/steak-display'
import { cn } from '@/lib/utils'

interface MetricCardsProps {
  result: SimulationResult
  locale: Locale
}

function Meter({ value, tone }: { value: number; tone: 'amber' | 'rose' }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800" aria-hidden="true">
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', tone === 'amber' ? 'bg-amber-500' : 'bg-rose-500')}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function MetricCards({ result, locale }: MetricCardsProps) {
  const isEn = locale === 'en'
  const [labelName, labelRange] = result.donenessLabel.split(' (')
  const grayTone = result.grayBandRatio > 25 ? 'text-rose-400' : result.grayBandRatio > 12 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <section aria-label="결과 요약" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="col-span-2 flex flex-col justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {isEn ? 'Final Doneness' : '완성된 스테이크 굽기'}
        </p>
        <div className="flex items-center gap-3">
          <span
            className="size-10 shrink-0 rounded-full ring-2 ring-zinc-700"
            style={{ backgroundColor: tempToColor(result.maxCoreTemp) }}
            aria-hidden="true"
          />
          <div>
            <p className="text-xl font-semibold leading-tight text-zinc-50 text-balance">
              {isEn ? labelName.split(' · ')[0] : labelName}
            </p>
            {labelRange ? <p className="font-mono text-xs text-zinc-500">{`(${labelRange}`}</p> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {isEn ? 'Peak Core Temp' : '속살(정중앙) 최종 온도'}
        </p>
        <p className="font-mono text-3xl font-semibold tabular-nums text-zinc-50">
          {result.maxCoreTemp.toFixed(1)}
          <span className="ml-1 text-base text-zinc-500">°C</span>
        </p>
        <p className="text-xs text-zinc-400">
          {isEn ? (
            <>
              Carryover during rest: <span className="font-mono text-amber-400">+{result.carryoverDelta.toFixed(1)}°C</span>
            </>
          ) : (
            <>
              레스팅 중 잔열로 <span className="font-mono text-amber-400">+{result.carryoverDelta.toFixed(1)}°C</span> 더 익음
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {isEn ? 'Overcooked Gray Band' : '오버쿡 테두리 (그레이밴드)'}
        </p>
        <p className={cn('font-mono text-3xl font-semibold tabular-nums', grayTone)}>
          {result.grayBandRatio.toFixed(1)}
          <span className="ml-1 text-base text-zinc-500">%</span>
        </p>
        <Meter value={result.grayBandRatio} tone="rose" />
        <p className="text-xs text-zinc-400">
          {isEn ? 'Lower means edge-to-edge tender pink meat' : '낮을수록 속살이 끝까지 촉촉하고 부드러움'}
        </p>
      </div>

      <div className="col-span-2 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 lg:col-span-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          {isEn ? 'Surface Crust Score' : '겉면 바삭함 (크러스트)'}
        </p>
        <p className="font-mono text-3xl font-semibold tabular-nums text-amber-400">
          {result.crustScore}
          <span className="ml-1 text-base text-zinc-500">{isEn ? '/ 100' : '점'}</span>
        </p>
        <Meter value={result.crustScore} tone="amber" />
        <p className="text-xs text-zinc-400">
          {isEn ? 'Higher means deeper Maillard sear flavor' : '높을수록 겉면 갈색 마이야르 풍미가 진함'}
        </p>
      </div>
    </section>
  )
}
