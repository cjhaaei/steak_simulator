import type { SimulationResult } from '@/lib/steak-simulation'
import { formatDuration, type Locale } from '@/lib/steak-display'
import { cn } from '@/lib/utils'

interface ModeComparisonProps {
  single: SimulationResult
  double: SimulationResult
  totalSearSec: number
  totalRestSec: number
  locale: Locale
}

const ROWS = [
  { key: 'maxCoreTemp', label: '속살 최고 온도', labelEn: 'Peak Core Temp', unit: '°C', better: 'none' },
  { key: 'carryoverDelta', label: '레스팅 잔열 상승', labelEn: 'Carryover Rise', unit: '°C', better: 'none' },
  { key: 'grayBandRatio', label: '오버쿡 비율 (그레이밴드)', labelEn: 'Overcooked Gray Band', unit: '%', better: 'lower' },
  { key: 'crustScore', label: '겉면 바삭함 (크러스트)', labelEn: 'Crust Score', unit: '', better: 'higher' },
] as const

export function ModeComparison({ single, double, totalSearSec, totalRestSec, locale }: ModeComparisonProps) {
  const isEn = locale === 'en'

  return (
    <section aria-labelledby="cmp-title" className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <header className="mb-4">
        <h2 id="cmp-title" className="text-base font-semibold text-zinc-50">
          {isEn ? 'Single Rest vs Double Rest Comparison' : '1회 굽기(싱글) vs 2회 나눠 굽기(더블 레스팅) 비교'}
        </h2>
        <p className="text-xs leading-relaxed text-zinc-400">
          {isEn
            ? `Compared under the same total sear (${formatDuration(totalSearSec, 'en')}) & total rest (${formatDuration(totalRestSec, 'en')})`
            : `동일한 총 굽기 시간(${formatDuration(totalSearSec, 'ko')})과 총 레스팅 시간(${formatDuration(totalRestSec, 'ko')})일 때 어떤 차이가 나는지 비교합니다.`}
        </p>
      </header>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
            <th scope="col" className="pb-2 font-normal">
              {isEn ? 'Metric' : '비교 항목'}
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              {isEn ? 'Single (1x)' : '1회 굽기 (싱글)'}
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              {isEn ? 'Double (2x)' : '2회 나눠 굽기 (더블)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const a = single[row.key]
            const b = double[row.key]
            const winner =
              row.better === 'none' || a === b
                ? null
                : row.better === 'lower'
                  ? a < b
                    ? 'single'
                    : 'double'
                  : a > b
                    ? 'single'
                    : 'double'
            return (
              <tr key={row.key} className="border-b border-zinc-800/60 last:border-0">
                <th scope="row" className="py-2.5 text-left font-normal text-zinc-300">
                  {isEn ? row.labelEn : row.label}
                </th>
                {(['single', 'double'] as const).map((mode) => (
                  <td
                    key={mode}
                    className={cn(
                      'py-2.5 text-right font-mono tabular-nums',
                      winner === mode ? 'text-amber-400' : 'text-zinc-200',
                    )}
                  >
                    {(mode === 'single' ? a : b).toFixed(row.key === 'crustScore' ? 0 : 1)}
                    <span className="ml-0.5 text-zinc-500">{row.unit}</span>
                  </td>
                ))}
              </tr>
            )
          })}
          <tr>
            <th scope="row" className="pt-2.5 text-left font-normal text-zinc-300">
              {isEn ? 'Final Doneness' : '최종 익힘 결과'}
            </th>
            <td className="pt-2.5 text-right text-xs text-zinc-200">{single.donenessLabel.split(' (')[0]}</td>
            <td className="pt-2.5 text-right text-xs text-zinc-200">{double.donenessLabel.split(' (')[0]}</td>
          </tr>
        </tbody>
      </table>
    </section>
  )
}
