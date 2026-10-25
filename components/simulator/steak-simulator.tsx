'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Globe, RotateCcw } from 'lucide-react'
import { runSteakSimulation, type SimulationParams, type TimeSeriesPoint } from '@/lib/steak-simulation'
import { DEFAULT_PARAMS, type Locale } from '@/lib/steak-display'
import { ControlPanel } from './control-panel'
import { MetricCards } from './metric-cards'
import { CrossSection } from './cross-section'
import { ModeComparison } from './mode-comparison'
import { cn } from '@/lib/utils'

function findSampleIndex(series: TimeSeriesPoint[], t: number) {
  let lo = 0
  let hi = series.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (series[mid].timeSec <= t) lo = mid
    else hi = mid - 1
  }
  return lo
}

export function SteakSimulator() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS)
  const [locale, setLocale] = useState<Locale>('ko')
  const isEn = locale === 'en'
  const deferredParams = useDeferredValue(params)

  const result = useMemo(() => runSteakSimulation(deferredParams), [deferredParams])

  const comparison = useMemo(() => {
    const totalSear = deferredParams.sear1Sec + deferredParams.sear2Sec
    const totalRest = deferredParams.rest1Sec + deferredParams.rest2Sec
    const single = runSteakSimulation({ ...deferredParams, mode: 'single', sear1Sec: totalSear, rest1Sec: totalRest })
    const double = runSteakSimulation({ ...deferredParams, mode: 'double' })
    return { single, double, totalSear, totalRest }
  }, [deferredParams])

  const [scrubTime, setScrubTime] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const totalSec = result.timeSeries.at(-1)?.timeSec ?? 0
  const currentTime = scrubTime === null ? totalSec : Math.min(scrubTime, totalSec)
  const sampleIdx = findSampleIndex(result.timeSeries, currentTime)

  useEffect(() => {
    if (!isPlaying) return
    const id = window.setInterval(() => {
      setScrubTime((prev) => {
        const base = prev === null || prev >= totalSec ? 0 : prev
        const next = base + Math.max(5, Math.round(totalSec / 180))
        if (next >= totalSec) {
          setIsPlaying(false)
          return totalSec
        }
        return next
      })
    }, 50)
    return () => window.clearInterval(id)
  }, [isPlaying, totalSec])

  const handleScrub = (t: number) => {
    setIsPlaying(false)
    setScrubTime(t)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-500">
            Easy Steak Cooking Guide
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl text-balance">
            {isEn ? (
              <>
                Visual <span className="text-amber-400">Steak Doneness</span> & Resting Simulator
              </>
            ) : (
              <>
                내 맘대로 구워보는 <span className="text-amber-400">스테이크 단면</span> 시뮬레이터
              </>
            )}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400 text-pretty">
            {isEn
              ? 'Select your cut, thickness, and target doneness (Rare to Well Done) to get optimal searing and resting times—and preview how the sliced interior looks.'
              : '고기 부위와 두께, 원하는 굽기(레어~웰던)를 고르면 딱 맞는 굽기 시간과 레스팅 시간을 추천해 드립니다. 시간을 조절하면서 스테이크 속살이 어떻게 익어가는지 한눈에 확인해 보세요!'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Language Switcher (Default: KO) */}
          <div
            role="group"
            aria-label="언어 선택"
            className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-1"
          >
            <Globe className="mx-1.5 size-3.5 text-zinc-500" aria-hidden="true" />
            {(
              [
                { id: 'ko', label: '한국어' },
                { id: 'en', label: 'ENG' },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLocale(lang.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  locale === lang.id ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100',
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setScrubTime(null)
              setParams(DEFAULT_PARAMS)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3.5 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-600 hover:text-zinc-50"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            {isEn ? 'Reset' : '초기화'}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ControlPanel
            params={params}
            locale={locale}
            onChange={(next) => {
              setScrubTime(null)
              setParams(next)
            }}
          />
        </div>

        <main className="flex min-w-0 flex-col gap-6">
          <MetricCards result={result} locale={locale} />
          <CrossSection
            params={deferredParams}
            result={result}
            sampleIdx={sampleIdx}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onScrub={handleScrub}
            onTogglePlay={() => {
              if (!isPlaying && currentTime >= totalSec) setScrubTime(0)
              setIsPlaying((p) => !p)
            }}
            thicknessCm={deferredParams.thicknessCm}
            cut={deferredParams.cut}
            locale={locale}
          />
          <ModeComparison
            single={comparison.single}
            double={comparison.double}
            totalSearSec={comparison.totalSear}
            totalRestSec={comparison.totalRest}
            locale={locale}
          />
        </main>
      </div>
    </div>
  )
}
