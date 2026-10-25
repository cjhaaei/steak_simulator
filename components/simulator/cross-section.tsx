import { Pause, Play } from 'lucide-react'
import { CUT_PROFILES, type SimulationParams, type SimulationResult, type SteakCut } from '@/lib/steak-simulation'
import {
  DONENESS_SCALE,
  EDIBILITY_GROUPS,
  formatClock,
  formatDuration,
  getDonenessStep,
  getStages,
  tempToColor,
  type Locale,
} from '@/lib/steak-display'
import { cn } from '@/lib/utils'

interface CrossSectionProps {
  params: SimulationParams
  result: SimulationResult
  sampleIdx: number
  currentTime: number
  isPlaying: boolean
  onScrub: (timeSec: number) => void
  onTogglePlay: () => void
  thicknessCm: number
  cut?: SteakCut
  locale: Locale
}

function toGradient(values: number[], colorFn: (t: number) => string) {
  const n = values.length
  return values.map((t, i) => `${colorFn(t)} ${((i / (n - 1)) * 100).toFixed(2)}%`).join(', ')
}

export function CrossSection({
  params,
  result,
  sampleIdx,
  currentTime,
  isPlaying,
  onScrub,
  onTogglePlay,
  thicknessCm,
  cut = 'striploin',
  locale,
}: CrossSectionProps) {
  const isEn = locale === 'en'
  const sample = result.timeSeries[sampleIdx]
  const peaks = result.profilePeaks[sampleIdx] ?? result.finalNodePeakTemps
  const n = peaks.length
  const coreIdx = Math.floor(n / 2)
  const quarterIdx = Math.floor(n / 4)
  const coreTempPeak = peaks[coreIdx]
  const coreStep = getDonenessStep(coreTempPeak)
  const coreGroup = EDIBILITY_GROUPS.find((g) => g.id === coreStep.edibility)
  const cutProfile = CUT_PROFILES[cut] ?? CUT_PROFILES.striploin
  const totalSec = result.timeSeries.at(-1)?.timeSec ?? 0
  const stages = getStages(params, locale)

  const verticalPeaks = [...peaks].reverse()

  const crustNodes = peaks.filter((t) => t >= 100).length
  const grayNodes = peaks.filter((t) => t >= 63 && t < 100).length
  const pinkNodes = peaks.filter((t) => t >= 49 && t < 63).length
  const rawNodes = peaks.filter((t) => t < 49).length

  const pct = (count: number) => Math.round((count / n) * 100)

  const [idealMin, idealMax] = cutProfile.idealTempRange
  const cutShortName = isEn ? cutProfile.nameEn : cutProfile.nameKo.split(' · ')[0]
  const fitStatus =
    coreTempPeak < idealMin - 3
      ? {
          text: isEn
            ? `Slightly under the recommended range (${idealMin}~${idealMax}°C) for ${cutShortName}`
            : `${cutShortName} 추천 익힘(${idealMin}~${idealMax}°C)보다 덜 익은 상태예요`,
          tone: 'text-rose-400',
        }
      : coreTempPeak > idealMax + 3
        ? {
            text: isEn
              ? `Slightly over the recommended range (${idealMin}~${idealMax}°C) for ${cutShortName}`
              : `${cutShortName} 추천 익힘(${idealMin}~${idealMax}°C)보다 더 익은 상태예요`,
            tone: 'text-amber-400',
          }
        : {
            text: isEn
              ? `Perfectly within the golden range (${idealMin}~${idealMax}°C) for ${cutShortName}!`
              : `${cutShortName}에 가장 맛있는 황금 익힘(${idealMin}~${idealMax}°C)입니다!`,
            tone: 'text-emerald-400',
          }

  const verticalTicks = [
    { label: isEn ? 'Top Crust' : '윗면 (겉)', temp: peaks[n - 1] },
    { label: isEn ? 'Upper 1/4' : '윗쪽 속살', temp: peaks[n - 1 - quarterIdx] },
    { label: isEn ? 'Center Core' : '정중앙 (심부)', temp: peaks[coreIdx], highlight: true },
    { label: isEn ? 'Lower 1/4' : '아랫쪽 속살', temp: peaks[quarterIdx] },
    { label: isEn ? 'Bottom Crust' : '아랫면 (겉)', temp: peaks[0] },
  ]

  const groupTitle = isEn ? coreGroup?.titleEn : coreGroup?.title

  return (
    <section aria-labelledby="xsec-title" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="xsec-title" className="text-lg font-semibold text-zinc-50">
            {isEn ? 'Sliced Steak Cross-Section' : '스테이크를 썰었을 때 단면 모습'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isEn
              ? `${cutProfile.nameEn} · ${thicknessCm.toFixed(1)}cm thick · ${
                  currentTime >= totalSec ? 'Completed (Final Slice)' : `At ${formatClock(sample?.timeSec ?? 0)}`
                }`
              : `${cutProfile.nameKo} · 두께 ${thicknessCm.toFixed(1)}cm · ${
                  currentTime >= totalSec ? '조리 완료 (최종 단면)' : `${formatClock(sample?.timeSec ?? 0)} 경과 (${sample?.phase ?? ''})`
                }`}
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-950 px-3.5 py-2 shadow-sm">
          <span className="size-3.5 rounded-full ring-2 ring-white/15" style={{ backgroundColor: coreStep.color }} aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-50">
              {isEn ? coreStep.label : `${coreStep.ko} (${coreStep.label})`}
            </span>
            <span className="font-mono text-[11px] text-amber-400">
              {isEn ? `Core ${coreTempPeak.toFixed(1)}°C · ${groupTitle ?? ''}` : `심부 ${coreTempPeak.toFixed(1)}°C · ${groupTitle ?? ''}`}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        {/* Step-by-step recipe summary bar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 p-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              {isEn
                ? `Step-by-Step Cooking Timeline (Total ${formatDuration(totalSec, 'en')} · ${
                    params.flipIntervalSec > 0 ? `Flip every ${params.flipIntervalSec}s` : 'No flipping'
                  })`
                : `따라 하기 쉬운 조리 순서 (총 ${formatDuration(totalSec, 'ko')} · ${
                    params.flipIntervalSec > 0 ? `구울 때 ${params.flipIntervalSec}초마다 뒤집기` : '한 면만 굽기'
                  })`}
            </span>
            <span className="font-mono text-xs text-amber-400">
              {`${formatClock(currentTime)} / ${formatClock(totalSec)}`}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((st, idx) => {
              const isCurrent = currentTime >= st.start && currentTime <= st.end && st.duration > 0
              return (
                <button
                  key={st.name}
                  type="button"
                  onClick={() => onScrub(st.end)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors',
                    isCurrent
                      ? 'border-amber-500/80 bg-amber-500/15'
                      : 'border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700',
                  )}
                >
                  <span className="text-[11px] text-zinc-400">
                    {isEn ? `Step ${idx + 1} · ${st.name}` : `${idx + 1}단계 · ${st.name}`}
                  </span>
                  <span className="mt-0.5 font-mono text-sm font-semibold text-zinc-100">{formatDuration(st.duration, locale)}</span>
                  <span className="mt-0.5 text-[10px] text-zinc-500">
                    {st.isCooking
                      ? isEn
                        ? 'Sear on hot pan'
                        : '팬 위에서 앞뒤로 굽기'
                      : isEn
                        ? 'Rest on warm board'
                        : '도마/접시에서 육즙 안정화'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Interactive timeline scrubber to watch the steak cook */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
            >
              {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {isPlaying ? (isEn ? 'Pause' : '일시정지') : isEn ? 'Play Cooking' : '굽는 과정 재생'}
            </button>
            <input
              type="range"
              min={0}
              max={totalSec}
              step={5}
              value={currentTime}
              onChange={(e) => onScrub(Number(e.target.value))}
              aria-label="조리 시점 이동"
              className="steak-range flex-1"
              style={{ '--fill': `${totalSec > 0 ? (currentTime / totalSec) * 100 : 100}%` } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={() => onScrub(totalSec)}
              className={cn(
                'shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors',
                currentTime >= totalSec
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200',
              )}
            >
              {isEn ? 'Final Slice' : '완성 단면 보기'}
            </button>
          </div>
        </div>

        {/* Realistic Vertical Steak Slice (Top crust -> Core -> Bottom crust) */}
        <div className="grid gap-4 sm:grid-cols-[1fr_155px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                {isEn
                  ? 'Vertical Cross-Section (Top & Bottom Crust / Juicy Center)'
                  : '스테이크 실제 절단면 (위·아래 바삭한 크러스트 / 가운데 속살)'}
              </span>
              <span className={coreGroup?.tone}>{groupTitle}</span>
            </div>
            <div
              className="relative h-52 w-full overflow-hidden rounded-[36px] border border-zinc-700/60 shadow-[inset_0_3px_16px_rgba(0,0,0,0.7)]"
              style={{ background: `linear-gradient(to bottom, ${toGradient(verticalPeaks, tempToColor)})` }}
              role="img"
              aria-label={`스테이크 단면 익힘 색상. 윗면 ${peaks[n - 1]}°C, 심부 ${peaks[coreIdx]}°C, 아랫면 ${peaks[0]}°C`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(105deg, transparent, transparent 10px, rgba(255,255,255,0.18) 10px, rgba(255,255,255,0.18) 11px)',
                }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-x-5 top-1/2 flex -translate-y-1/2 items-center justify-between border-t border-dashed border-white/45 pt-1.5 text-xs font-medium text-white drop-shadow"
                aria-hidden="true"
              >
                <span>{isEn ? 'Center Core' : '스테이크 정중앙 (심부)'}</span>
                <span className="rounded-md bg-black/65 px-2 py-0.5 font-mono text-xs font-semibold text-amber-300">
                  {isEn ? `${coreStep.label} (${coreTempPeak.toFixed(1)}°C)` : `${coreStep.ko} (${coreTempPeak.toFixed(1)}°C)`}
                </span>
              </div>
            </div>
          </div>

          {/* Depth temperature ruler on the right */}
          <div className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-3.5 py-3">
            {verticalTicks.map((t) => (
              <div key={t.label} className="flex items-center justify-between gap-2 text-xs">
                <span className={t.highlight ? 'font-semibold text-amber-400' : 'text-[11px] text-zinc-400'}>{t.label}</span>
                <span className={t.highlight ? 'font-mono font-bold text-amber-300' : 'font-mono text-zinc-200'}>
                  {`${t.temp.toFixed(0)}°C`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cut-specific recommendation banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800/90 bg-zinc-950/80 px-3.5 py-2.5 text-xs">
          <span className={cn('font-medium', fitStatus.tone)}>{fitStatus.text}</span>
          <span className="font-mono text-[11px] text-zinc-400">
            {isEn
              ? `Crust ${pct(crustNodes)}% · Gray Band ${pct(grayNodes)}% · Pink Center ${pct(pinkNodes)}% · Rare/Raw ${pct(rawNodes)}%`
              : `겉면 크러스트 ${pct(crustNodes)}% · 회색 띠(오버쿡) ${pct(grayNodes)}% · 분홍 속살 ${pct(pinkNodes)}% · 생고기 ${pct(rawNodes)}%`}
          </span>
        </div>

        <div className="grid gap-3 border-t border-zinc-800/70 pt-3 sm:grid-cols-2">
          {EDIBILITY_GROUPS.map((group) => (
            <div key={group.id} className="flex flex-col gap-1.5">
              <span className={`text-[11px] font-medium ${group.tone}`}>{isEn ? group.titleEn : group.title}</span>
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {DONENESS_SCALE.filter((s) => s.edibility === group.id).map((step) => (
                  <li key={step.label} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: step.color }} aria-hidden="true" />
                    {isEn ? step.label : step.ko}
                    <span className="font-mono text-zinc-600">
                      {Number.isFinite(step.min) ? `${step.min}°+` : '<43°'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
