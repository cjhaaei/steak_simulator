'use client'

import { useId, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  CUT_PROFILES,
  DONENESS_TARGETS,
  recommendCookingTimes,
  type SimulationParams,
  type SteakCut,
  type TargetDoneness,
} from '@/lib/steak-simulation'
import { INITIAL_TEMP_PRESETS, PAN_PRESETS, formatDuration, type Locale } from '@/lib/steak-display'
import { cn } from '@/lib/utils'

type NumericKey = Exclude<keyof SimulationParams, 'mode' | 'cut'>

interface ControlPanelProps {
  params: SimulationParams
  locale: Locale
  onChange: (params: SimulationParams) => void
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: 'cm' | '°C' | 'sec'
  locale: Locale
  hint?: string
  disabled?: boolean
  onChange: (value: number) => void
}

function SliderField({ label, value, min, max, step, unit, locale, hint, disabled, onChange }: SliderFieldProps) {
  const id = useId()
  const display =
    unit === 'sec'
      ? value === 0 && (label.includes('뒤집기') || label.includes('Flip'))
        ? locale === 'en'
          ? 'No flip'
          : '안 뒤집음'
        : formatDuration(value, locale)
      : `${value}${unit ?? ''}`
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex flex-col gap-2', disabled && 'pointer-events-none opacity-35')}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm text-zinc-300">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-sm tabular-nums text-amber-400">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="steak-range"
        style={{ '--fill': `${percent}%` } as React.CSSProperties}
      />
      {hint ? <p className="text-xs leading-relaxed text-zinc-500">{hint}</p> : null}
    </div>
  )
}

function Section({
  title,
  index,
  first = false,
  children,
}: {
  title: string
  index: string
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset className={cn('flex flex-col gap-5', !first && 'border-t border-zinc-800 pt-5')}>
      <legend className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-semibold text-amber-400">{index}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export function ControlPanel({ params, locale, onChange }: ControlPanelProps) {
  const [selectedDoneness, setSelectedDoneness] = useState<TargetDoneness>('medium-rare')
  const [autoAdjust, setAutoAdjust] = useState<boolean>(true)
  const isEn = locale === 'en'

  const currentCut = CUT_PROFILES[params.cut ?? 'striploin']
  const isDouble = params.mode === 'double'

  const updateCondition = (patch: Partial<SimulationParams>, targetOverride?: TargetDoneness) => {
    const nextBase = { ...params, ...patch }
    const target = targetOverride ?? selectedDoneness
    if (autoAdjust || targetOverride) {
      const rec = recommendCookingTimes(nextBase, target)
      onChange({ ...nextBase, ...rec })
    } else {
      onChange(nextBase)
    }
  }

  const handleSelectDoneness = (doneness: TargetDoneness) => {
    setSelectedDoneness(doneness)
    setAutoAdjust(true)
    const rec = recommendCookingTimes(params, doneness)
    onChange({ ...params, ...rec })
  }

  const handleManualTime = (key: NumericKey) => (value: number) => {
    setAutoAdjust(false)
    onChange({ ...params, [key]: value })
  }

  const activeTargetObj = DONENESS_TARGETS.find((d) => d.id === selectedDoneness)

  return (
    <aside aria-label="시뮬레이션 설정" className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <Section index="STEP 1" title={isEn ? 'Meat & Pan Setup' : '고기 & 팬 조건 선택'} first>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-zinc-300">{isEn ? 'Steak Cut' : '스테이크 부위'}</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(CUT_PROFILES) as SteakCut[]).map((cutKey) => {
              const c = CUT_PROFILES[cutKey]
              const active = (params.cut ?? 'striploin') === cutKey
              return (
                <button
                  key={cutKey}
                  type="button"
                  onClick={() => updateCondition({ cut: cutKey })}
                  className={cn(
                    'flex flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors',
                    active
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
                  )}
                >
                  <span className="text-xs font-semibold">{isEn ? c.nameEn : c.nameKo.split(' · ')[0]}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{isEn ? c.nameKo.split(' · ')[0] : c.nameEn}</span>
                </button>
              )
            })}
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/70 px-3 py-2 text-[11px] leading-relaxed text-zinc-400">
            <p className="font-medium text-amber-400/90">
              {isEn ? `Recommended: ${currentCut.idealDonenessEn}` : `부위 추천 굽기: ${currentCut.idealDonenessKo}`}
            </p>
            <p className="mt-0.5 text-zinc-500">{isEn ? currentCut.descriptionEn : currentCut.description}</p>
          </div>
        </div>

        <SliderField
          label={isEn ? 'Steak Thickness' : '고기 두께'}
          value={params.thicknessCm}
          min={2.0}
          max={6.0}
          step={0.5}
          unit="cm"
          locale={locale}
          onChange={(v) => updateCondition({ thicknessCm: v })}
        />

        <div className="flex flex-col gap-2">
          <SliderField
            label={isEn ? 'Starting Meat Temp' : '굽기 전 고기 상태 (내부 온도)'}
            value={params.initialTempC}
            min={2}
            max={22}
            step={1}
            unit="°C"
            locale={locale}
            onChange={(v) => updateCondition({ initialTempC: v })}
          />
          <div className="grid grid-cols-3 gap-1.5">
            {INITIAL_TEMP_PRESETS.map((p) => (
              <button
                key={p.tempC}
                type="button"
                onClick={() => updateCondition({ initialTempC: p.tempC })}
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] transition-colors',
                  params.initialTempC === p.tempC
                    ? 'border-amber-500/70 bg-amber-500/15 text-amber-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200',
                )}
              >
                {isEn ? p.labelEn : p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SliderField
            label={isEn ? 'Pan Heat (Surface Temp)' : '팬 화력 (표면 온도)'}
            value={params.panTempC}
            min={170}
            max={265}
            step={5}
            unit="°C"
            locale={locale}
            onChange={(v) => updateCondition({ panTempC: v })}
          />
          <div className="grid grid-cols-3 gap-1.5">
            {PAN_PRESETS.map((p) => (
              <button
                key={p.tempC}
                type="button"
                onClick={() => updateCondition({ panTempC: p.tempC })}
                className={cn(
                  'flex flex-col items-center rounded-md border px-1.5 py-1.5 text-center transition-colors',
                  params.panTempC === p.tempC
                    ? 'border-amber-500/70 bg-amber-500/15 text-amber-300'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200',
                )}
              >
                <span className="text-[11px] font-medium">{isEn ? p.labelEn : p.label}</span>
                <span className="font-mono text-[10px] text-zinc-500">{`${p.tempC}°C`}</span>
              </button>
            ))}
          </div>
        </div>

        <SliderField
          label={isEn ? 'Flip Interval' : '뒤집기 주기'}
          value={params.flipIntervalSec}
          min={15}
          max={120}
          step={15}
          unit="sec"
          locale={locale}
          hint={
            isEn
              ? 'Flipping every 30s cooks the interior much more evenly.'
              : '30초마다 자주 뒤집으면 속이 훨씬 고르게 익습니다.'
          }
          onChange={(v) => updateCondition({ flipIntervalSec: v })}
        />
      </Section>

      <Section index="STEP 2" title={isEn ? 'Target Doneness (Auto-Time)' : '원하는 익힘 선택 (시간 자동 추천)'}>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-400">
            {isEn ? (
              <>
                Pick your target doneness and we will automatically set the{' '}
                <strong className="text-amber-400">optimal searing & resting times</strong> for your steak.
              </>
            ) : (
              <>
                원하는 굽기를 누르면 위에서 고른 고기·팬 조건에 딱 맞는{' '}
                <strong className="text-amber-400">최적의 굽기/레스팅 시간</strong>을 자동으로 계산해 줍니다.
              </>
            )}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {DONENESS_TARGETS.map((d) => {
              const active = autoAdjust && selectedDoneness === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDoneness(d.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-center transition-all',
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-zinc-50 shadow-sm'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200',
                  )}
                >
                  <span className="size-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] font-semibold leading-tight">{isEn ? d.nameEn.replace('Medium ', 'Med ') : d.nameKo}</span>
                  <span className="font-mono text-[9px] text-zinc-500">{d.rangeText}</span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => handleSelectDoneness(selectedDoneness)}
            className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            <Sparkles className="size-3.5" />
            {isEn
              ? `Auto-match optimal time for '${activeTargetObj?.nameEn}'`
              : `현재 고기 조건으로 '${activeTargetObj?.nameKo}' 최적 시간 다시 맞추기`}
          </button>
        </div>
      </Section>

      <Section index="STEP 3" title={isEn ? 'Fine-Tune Cooking & Resting' : '굽기 & 레스팅 시간 직접 조절해보기'}>
        <div role="radiogroup" aria-label="조리 모드" className="grid grid-cols-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          {(
            [
              { id: 'single', label: isEn ? 'Single Rest (1x)' : '1회 굽기 (싱글)' },
              { id: 'double', label: isEn ? 'Double Rest (2x)' : '2회 나눠 굽기 (더블 레스팅)' },
            ] as const
          ).map((m) => {
            const active = params.mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateCondition({ mode: m.id })}
                className={cn(
                  'rounded-md py-2 text-xs font-medium transition-colors',
                  active ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100',
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        <SliderField
          label={isEn ? '1st Sear Time' : '1차 굽기 시간'}
          value={params.sear1Sec}
          min={30}
          max={900}
          step={15}
          unit="sec"
          locale={locale}
          onChange={handleManualTime('sear1Sec')}
        />
        <SliderField
          label={isEn ? '1st Rest Time' : '1차 레스팅 (휴지)'}
          value={params.rest1Sec}
          min={30}
          max={900}
          step={30}
          unit="sec"
          locale={locale}
          onChange={handleManualTime('rest1Sec')}
        />
        <SliderField
          label={isEn ? '2nd Sear Time' : '2차 굽기 시간'}
          value={params.sear2Sec}
          min={0}
          max={420}
          step={15}
          unit="sec"
          locale={locale}
          disabled={!isDouble}
          onChange={handleManualTime('sear2Sec')}
        />
        <SliderField
          label={isEn ? '2nd Rest Time' : '2차 레스팅 (휴지)'}
          value={params.rest2Sec}
          min={0}
          max={900}
          step={30}
          unit="sec"
          locale={locale}
          disabled={!isDouble}
          onChange={handleManualTime('rest2Sec')}
        />
      </Section>
    </aside>
  )
}
