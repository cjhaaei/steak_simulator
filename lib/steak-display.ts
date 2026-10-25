import type { SimulationParams } from './steak-simulation'

export type Locale = 'ko' | 'en'

export const DEFAULT_PARAMS: SimulationParams = {
  cut: 'striploin',
  thicknessCm: 3.5,
  initialTempC: 8,
  panTempC: 225,
  ambientTempC: 22,
  flipIntervalSec: 30,
  mode: 'double',
  sear1Sec: 255,
  rest1Sec: 270,
  sear2Sec: 90,
  rest2Sec: 210,
}

export const PAN_PRESETS: { label: string; labelEn: string; sub: string; tempC: number }[] = [
  { label: '중불 · 코팅팬', labelEn: 'Med · Non-stick', sub: '190°C', tempC: 190 },
  { label: '강불 · 스텐/코팅', labelEn: 'High · Stainless', sub: '225°C', tempC: 225 },
  { label: '초강불 · 무쇠팬', labelEn: 'Max · Cast Iron', sub: '255°C', tempC: 255 },
]

export const INITIAL_TEMP_PRESETS: { label: string; labelEn: string; tempC: number }[] = [
  { label: '냉장고 직후 (4°C)', labelEn: 'Fridge Cold (4°C)', tempC: 4 },
  { label: '30분 해동 (10°C)', labelEn: '30m Rested (10°C)', tempC: 10 },
  { label: '실온 템퍼링 (18°C)', labelEn: 'Room Temp (18°C)', tempC: 18 },
]

export type Edibility = 'raw' | 'caution' | 'edible' | 'surface'

export const DONENESS_SCALE: {
  min: number
  label: string
  ko: string
  color: string
  edibility: Edibility
}[] = [
  { min: -Infinity, label: 'Raw', ko: '생고기', color: '#6e2140', edibility: 'raw' },
  { min: 43, label: 'Blue', ko: '블루', color: '#9b1f3c', edibility: 'caution' },
  { min: 49, label: 'Rare', ko: '레어', color: '#c8303f', edibility: 'edible' },
  { min: 53, label: 'Med Rare', ko: '미디엄 레어', color: '#df5d63', edibility: 'edible' },
  { min: 58, label: 'Medium', ko: '미디엄', color: '#e9989a', edibility: 'edible' },
  { min: 63, label: 'Med Well', ko: '미디엄 웰', color: '#d6b2a6', edibility: 'edible' },
  { min: 68, label: 'Well Done', ko: '웰던', color: '#a68d80', edibility: 'edible' },
  { min: 100, label: 'Browned', ko: '갈변', color: '#8a5634', edibility: 'surface' },
  { min: 130, label: 'Crust', ko: '크러스트', color: '#4a2914', edibility: 'surface' },
]

export const EDIBILITY_GROUPS: { id: Edibility; title: string; titleEn: string; tone: string }[] = [
  { id: 'raw', title: '섭취 비권장', titleEn: 'Under-cooked', tone: 'text-rose-400' },
  { id: 'caution', title: '섭취 주의', titleEn: 'Very Rare', tone: 'text-amber-400' },
  { id: 'edible', title: '섭취 가능', titleEn: 'Ideal Doneness', tone: 'text-emerald-400' },
  { id: 'surface', title: '표면 반응', titleEn: 'Surface Sear', tone: 'text-zinc-400' },
]

export function getDonenessStep(tempC: number) {
  let step = DONENESS_SCALE[0]
  for (const s of DONENESS_SCALE) {
    if (tempC >= s.min) step = s
  }
  return step
}

export function tempToColor(tempC: number): string {
  return getDonenessStep(tempC).color
}

const HEAT_STOPS: [number, [number, number, number]][] = [
  [0, [30, 58, 138]],
  [20, [37, 99, 235]],
  [40, [124, 58, 237]],
  [55, [219, 39, 119]],
  [70, [249, 115, 22]],
  [100, [250, 204, 21]],
  [155, [254, 249, 195]],
]

export function heatColor(tempC: number): string {
  const t = Math.min(Math.max(tempC, HEAT_STOPS[0][0]), HEAT_STOPS[HEAT_STOPS.length - 1][0])
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [t1, c1] = HEAT_STOPS[i]
    const [t0, c0] = HEAT_STOPS[i - 1]
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0)
      const mix = c0.map((v, j) => Math.round(v + (c1[j] - v) * f))
      return `rgb(${mix[0]} ${mix[1]} ${mix[2]})`
    }
  }
  return 'rgb(254 249 195)'
}

export function formatDuration(totalSec: number, locale: Locale = 'ko'): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.round(totalSec % 60)
  if (locale === 'en') {
    if (m === 0) return `${s}s`
    if (s === 0) return `${m}m`
    return `${m}m ${s}s`
  }
  if (m === 0) return `${s}초`
  if (s === 0) return `${m}분`
  return `${m}분 ${s}초`
}

export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = Math.round(totalSec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getStages(params: SimulationParams, locale: Locale = 'ko') {
  const stages = [
    { name: locale === 'en' ? '1st Sear' : '1차 시어링', duration: params.sear1Sec, isCooking: true },
    { name: locale === 'en' ? '1st Rest' : '1차 레스팅', duration: params.rest1Sec, isCooking: false },
  ]
  if (params.mode === 'double') {
    stages.push(
      { name: locale === 'en' ? '2nd Sear' : '2차 시어링', duration: params.sear2Sec, isCooking: true },
      { name: locale === 'en' ? '2nd Rest' : '2차 레스팅', duration: params.rest2Sec, isCooking: false },
    )
  }
  let start = 0
  return stages.map((stage) => {
    const s = { ...stage, start, end: start + stage.duration }
    start += stage.duration
    return s
  })
}
