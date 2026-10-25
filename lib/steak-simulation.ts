export type SteakCut = 'tenderloin' | 'striploin' | 'ribeye';
export type TargetDoneness = 'rare' | 'medium-rare' | 'medium' | 'medium-well' | 'well';

export interface SimulationParams {
  cut: SteakCut;
  thicknessCm: number;
  initialTempC: number;
  panTempC: number;
  ambientTempC: number;
  flipIntervalSec: number;
  mode: 'single' | 'double';
  sear1Sec: number;
  rest1Sec: number;
  sear2Sec: number;
  rest2Sec: number;
}

export interface DonenessTargetInfo {
  id: TargetDoneness;
  nameKo: string;
  nameEn: string;
  targetTempC: number;
  rangeText: string;
  description: string;
  color: string;
}

export const DONENESS_TARGETS: DonenessTargetInfo[] = [
  {
    id: 'rare',
    nameKo: '레어',
    nameEn: 'Rare',
    targetTempC: 50.5,
    rangeText: '49~52°C',
    description: '겉만 바삭하고 속은 촉촉한 붉은 육즙이 가득한 상태',
    color: '#c8303f',
  },
  {
    id: 'medium-rare',
    nameKo: '미디엄 레어',
    nameEn: 'Medium Rare',
    targetTempC: 55.0,
    rangeText: '53~57°C',
    description: '가장 대중적인 황금 굽기! 부드러운 식감과 풍부한 육즙',
    color: '#df5d63',
  },
  {
    id: 'medium',
    nameKo: '미디엄',
    nameEn: 'Medium',
    targetTempC: 60.0,
    rangeText: '58~62°C',
    description: '지방(마블링)이 충분히 녹아 고소하고 담백한 핑크빛 속살',
    color: '#e9989a',
  },
  {
    id: 'medium-well',
    nameKo: '미디엄 웰',
    nameEn: 'Medium Well',
    targetTempC: 65.0,
    rangeText: '63~67°C',
    description: '핏기 없이 은은한 핑크빛만 살짝 남긴 탄탄한 식감',
    color: '#d6b2a6',
  },
  {
    id: 'well',
    nameKo: '웰던',
    nameEn: 'Well Done',
    targetTempC: 70.0,
    rangeText: '68°C+',
    description: '속까지 완전히 익혀 고소하고 쫄깃한 식감',
    color: '#a68d80',
  },
];

export interface CutProfile {
  id: SteakCut;
  nameKo: string;
  nameEn: string;
  alpha: number;
  kBeef: number;
  surfaceWaterKgPerM2: number;
  defaultThicknessCm: number;
  recommendedDoneness: TargetDoneness;
  idealDonenessKo: string;
  idealDonenessEn: string;
  idealTempRange: [number, number];
  description: string;
  descriptionEn: string;
}

export const CUT_PROFILES: Record<SteakCut, CutProfile> = {
  tenderloin: {
    id: 'tenderloin',
    nameKo: '안심',
    nameEn: 'Tenderloin',
    alpha: 2.15e-7,
    kBeef: 0.54,
    surfaceWaterKgPerM2: 0.32,
    defaultThicknessCm: 4.0,
    recommendedDoneness: 'medium-rare',
    idealDonenessKo: '레어 ~ 미디엄 레어 (50~55°C)',
    idealDonenessEn: 'Rare to Medium Rare (50~55°C)',
    idealTempRange: [50, 55],
    description: '지방이 적고 수분이 많아 열전달이 빠르며, 과조리 시 쉽게 퍽퍽해집니다.',
    descriptionEn: 'Very lean and tender with high moisture; cooks fast and can dry out if overcooked.',
  },
  striploin: {
    id: 'striploin',
    nameKo: '채끝 · 뉴욕스트립',
    nameEn: 'Striploin',
    alpha: 2.0e-7,
    kBeef: 0.50,
    surfaceWaterKgPerM2: 0.30,
    defaultThicknessCm: 3.5,
    recommendedDoneness: 'medium-rare',
    idealDonenessKo: '미디엄 레어 (53~57°C)',
    idealDonenessEn: 'Medium Rare (53~57°C)',
    idealTempRange: [53, 57],
    description: '살코기와 마블링의 균형이 좋아 가장 표준적인 열확산 특성을 보입니다.',
    descriptionEn: 'Balanced marbling and beefy bite with classic, predictable heat transfer.',
  },
  ribeye: {
    id: 'ribeye',
    nameKo: '꽃등심 · 립아이',
    nameEn: 'Ribeye',
    alpha: 1.82e-7,
    kBeef: 0.46,
    surfaceWaterKgPerM2: 0.27,
    defaultThicknessCm: 3.5,
    recommendedDoneness: 'medium',
    idealDonenessKo: '미디엄 레어 ~ 미디엄 (56~60°C)',
    idealDonenessEn: 'Med Rare to Medium (56~60°C)',
    idealTempRange: [56, 60],
    description: '마블링(지방)이 풍부해 열전도가 느리며, 지방이 충분히 녹는 56°C 이상에서 풍미가 극대화됩니다.',
    descriptionEn: 'Rich marbling slows heat transfer; cooking to 56°C+ renders fat for peak juiciness.',
  },
};

export interface TimeSeriesPoint {
  timeSec: number;
  phase: string;
  surfaceTemp: number;
  quarterTemp: number;
  coreTemp: number;
}

export interface SimulationResult {
  timeSeries: TimeSeriesPoint[];
  /** Node temperatures at each timeSeries sample (same index). */
  profileTemps: number[][];
  /** Running peak temperature per node at each timeSeries sample (same index). */
  profilePeaks: number[][];
  finalNodePeakTemps: number[];
  coreTempAfterSear: number;
  maxCoreTemp: number;
  carryoverDelta: number;
  grayBandRatio: number;
  crustScore: number;
  donenessLabel: string;
}

export const PHYSICS = {
  nodes: 51,
  alpha: 2.0e-7,
  kBeef: 0.50,
  hPan: 450,
  hAirCook: 16,
  hAirRest: 10,
  hRestEvaporation: 18,
  surfaceWaterKgPerM2: 0.30,
  latentHeat: 2.26e6,
  maxSurfaceTemp: 175,
  sampleEverySec: 5,
} as const;

export function getNumerics(thicknessCm: number, cut: SteakCut = 'striploin') {
  const cutProfile = CUT_PROFILES[cut] ?? CUT_PROFILES.striploin;
  const dx = thicknessCm / 100 / (PHYSICS.nodes - 1);
  const biot = (PHYSICS.hPan * dx) / cutProfile.kBeef;
  // Explicit FTCS stability incl. convective boundary node: 2r(1 + Bi) <= 1, with 20% margin.
  const dtMax = (0.4 * dx * dx) / (cutProfile.alpha * (1 + biot));
  const substeps = Math.max(1, Math.ceil(1 / dtMax));
  const dt = 1 / substeps;
  const r = (cutProfile.alpha * dt) / (dx * dx);
  return { dx, dt, substeps, r, biot, stabilityLimit: 1 / (2 * (1 + biot)), cutProfile };
}

export function runSteakSimulation(params: SimulationParams): SimulationResult {
  const N = PHYSICS.nodes;
  const cutKey: SteakCut = params.cut ?? 'striploin';
  const { dx, dt, substeps, r, cutProfile } = getNumerics(params.thicknessCm, cutKey);
  const { hPan, hAirCook, hAirRest } = PHYSICS;
  const kBeef = cutProfile.kBeef;
  const rhoC = kBeef / cutProfile.alpha;
  const halfCellHeatCapacity = rhoC * (dx / 2);

  let T = new Array<number>(N).fill(params.initialTempC);
  let Tn = new Array<number>(N).fill(params.initialTempC);
  const T_peak = new Array<number>(N).fill(params.initialTempC);
  const initialMoisture = cutProfile.surfaceWaterKgPerM2 * PHYSICS.latentHeat;
  // Surface water evaporation budget per face (J/m²). While wet, the face is pinned at 100°C.
  const moisture = [initialMoisture, initialMoisture];

  const centerIdx = Math.floor(N / 2);
  const quarterIdx = Math.floor(N / 4);

  const stages = [
    { name: '1차 시어링', duration: params.sear1Sec, isCooking: true },
    { name: '1차 레스팅', duration: params.rest1Sec, isCooking: false },
  ];
  if (params.mode === 'double') {
    stages.push(
      { name: '2차 시어링', duration: params.sear2Sec, isCooking: true },
      { name: '2차 레스팅', duration: params.rest2Sec, isCooking: false },
    );
  }

  const timeSeries: TimeSeriesPoint[] = [];
  const profileTemps: number[][] = [];
  const profilePeaks: number[][] = [];
  let currentTime = 0;
  let cookingTimeElapsed = 0;
  let isBottomOnPan = true;
  let coreTempAfterSear = params.initialTempC;
  let maxCoreTemp = params.initialTempC;
  let totalCarryover = 0;
  let crustAccumulator = 0;

  const round1 = (v: number) => Math.round(v * 10) / 10;
  const record = (phase: string) => {
    timeSeries.push({
      timeSec: currentTime,
      phase,
      surfaceTemp: round1(Math.max(T[0], T[N - 1])),
      quarterTemp: round1((T[quarterIdx] + T[N - 1 - quarterIdx]) / 2),
      coreTemp: round1(T[centerIdx]),
    });
    profileTemps.push(T.map(round1));
    profilePeaks.push(T_peak.map(round1));
  };

  record(stages[0].name);

  const surfaceStep = (face: 0 | 1, node: number, neighbor: number, onPan: boolean, cooking: boolean) => {
    let h: number;
    let tInf: number;
    if (!cooking) {
      // Hot surfaces keep steaming while resting; evaporative cooling fades out as the face drops toward 40°C.
      h = hAirRest + PHYSICS.hRestEvaporation * Math.min(1, Math.max(0, (node - 40) / 60));
      tInf = params.ambientTempC;
      // Internal juice slightly re-wets the dry crust during resting (up to 18% of initial moisture)
      moisture[face] = Math.min(initialMoisture * 0.18, moisture[face] + initialMoisture * 0.00025 * dt);
    } else if (onPan) {
      h = hPan;
      tInf = params.panTempC;
    } else {
      h = hAirCook;
      tInf = params.ambientTempC + 15;
    }
    let next = node + 2 * r * (neighbor - node + (dx * h * (tInf - node)) / kBeef);

    if (next > 100 && moisture[face] > 0) {
      const excess = (next - 100) * halfCellHeatCapacity;
      const used = Math.min(excess, moisture[face]);
      moisture[face] -= used;
      next -= used / halfCellHeatCapacity;
    }
    // Once dry, sub-surface water keeps wicking out and limits the crust to Maillard range.
    return Math.min(next, PHYSICS.maxSurfaceTemp, Math.max(params.panTempC, 100));
  };

  for (const stage of stages) {
    const stageStartCore = T[centerIdx];
    let stagePeakCore = stageStartCore;

    for (let s = 1; s <= stage.duration; s++) {
      currentTime += 1;

      if (stage.isCooking) {
        cookingTimeElapsed += 1;
      }

      for (let sub = 0; sub < substeps; sub++) {
        for (let i = 1; i < N - 1; i++) {
          Tn[i] = T[i] + r * (T[i - 1] - 2 * T[i] + T[i + 1]);
        }
        Tn[0] = surfaceStep(0, T[0], T[1], isBottomOnPan, stage.isCooking);
        Tn[N - 1] = surfaceStep(1, T[N - 1], T[N - 2], !isBottomOnPan, stage.isCooking);
        const swap = T;
        T = Tn;
        Tn = swap;

        for (let i = 0; i < N; i++) {
          if (T[i] > T_peak[i]) T_peak[i] = T[i];
        }
        if (stage.isCooking) {
          const active = isBottomOnPan ? T[0] : T[N - 1];
          if (active >= 130) crustAccumulator += (active - 125) * 0.012 * dt;
        }
      }

      if (stage.isCooking && params.flipIntervalSec > 0 && cookingTimeElapsed % params.flipIntervalSec === 0) {
        isBottomOnPan = !isBottomOnPan;
      }

      if (T[centerIdx] > maxCoreTemp) maxCoreTemp = T[centerIdx];
      if (T[centerIdx] > stagePeakCore) stagePeakCore = T[centerIdx];

      if (currentTime % PHYSICS.sampleEverySec === 0 || s === stage.duration) {
        record(stage.name);
      }
    }

    if (stage.isCooking && stage.duration > 0) {
      coreTempAfterSear = round1(T[centerIdx]);
    } else if (!stage.isCooking && stage.duration > 0) {
      totalCarryover += Math.max(0, stagePeakCore - stageStartCore);
    }
  }

  const overcookedNodes = T_peak.slice(1, N - 1).filter((t) => t >= 63.0).length;
  const grayBandRatio = round1((overcookedNodes / (N - 2)) * 100);
  const carryoverDelta = round1(Math.max(maxCoreTemp - coreTempAfterSear, totalCarryover));

  return {
    timeSeries,
    profileTemps,
    profilePeaks,
    finalNodePeakTemps: T_peak.map(round1),
    coreTempAfterSear,
    maxCoreTemp: round1(maxCoreTemp),
    carryoverDelta,
    grayBandRatio,
    crustScore: Math.min(100, Math.round(crustAccumulator)),
    donenessLabel: getDonenessLabel(maxCoreTemp),
  };
}

export function getDonenessLabel(coreTemp: number): string {
  if (coreTemp >= 68) return 'Well Done (68°C+)';
  if (coreTemp >= 63) return 'Medium Well (63~67°C)';
  if (coreTemp >= 58) return 'Medium (58~62°C)';
  if (coreTemp >= 53) return 'Medium Rare (53~57°C)';
  if (coreTemp >= 49) return 'Rare (49~52°C)';
  if (coreTemp >= 43) return 'Blue (43~48°C)';
  return 'Raw · 생고기 (< 43°C)';
}

/**
 * 현재 고기 조건(부위, 두께, 초기온도, 팬온도, 뒤집기주기, 싱글/더블 모드)에서
 * 사용자가 선택한 목표 익힘(TargetDoneness)의 정중앙 온도에 도달하도록
 * 최적의 시어링 & 레스팅 시간을 이진 탐색으로 역산하여 추천합니다.
 */
export function recommendCookingTimes(
  baseParams: SimulationParams,
  targetDoneness: TargetDoneness,
): Pick<SimulationParams, 'sear1Sec' | 'rest1Sec' | 'sear2Sec' | 'rest2Sec'> {
  const targetInfo = DONENESS_TARGETS.find((d) => d.id === targetDoneness) ?? DONENESS_TARGETS[1];
  const targetTemp = targetInfo.targetTempC;

  // 레스팅 시간은 두께에 비례해 설정 (두꺼울수록 열이 중심까지 퍼지는 데 시간이 걸림)
  const round15 = (sec: number) => Math.max(30, Math.round(sec / 15) * 15);
  const round30 = (sec: number) => Math.max(60, Math.round(sec / 30) * 30);

  if (baseParams.mode === 'single') {
    const rest1Sec = round30(baseParams.thicknessCm * 95);
    let lo = 60;
    let hi = 1200;
    let bestTotalSear = 300;
    let bestDiff = Infinity;

    for (let iter = 0; iter < 11; iter++) {
      const mid = Math.round((lo + hi) / 2);
      const sim = runSteakSimulation({
        ...baseParams,
        mode: 'single',
        sear1Sec: mid,
        rest1Sec,
        sear2Sec: 0,
        rest2Sec: 0,
      });
      const diff = Math.abs(sim.maxCoreTemp - targetTemp);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestTotalSear = mid;
      }
      if (sim.maxCoreTemp < targetTemp) {
        lo = mid + 5;
      } else {
        hi = mid - 5;
      }
    }

    return {
      sear1Sec: round15(bestTotalSear),
      rest1Sec,
      sear2Sec: 0,
      rest2Sec: 0,
    };
  } else {
    // 더블 레스팅: 1차 시어링 72%, 2차 시어링 28% 비율로 배분하고 중간 레스팅으로 열을 깊숙이 전달
    const rest1Sec = round30(baseParams.thicknessCm * 75);
    const rest2Sec = round30(baseParams.thicknessCm * 55);
    let lo = 90;
    let hi = 1350;
    let bestTotalSear = 360;
    let bestDiff = Infinity;

    for (let iter = 0; iter < 11; iter++) {
      const mid = Math.round((lo + hi) / 2);
      const s1 = Math.max(60, Math.round(mid * 0.74));
      const s2 = Math.max(30, mid - s1);
      const sim = runSteakSimulation({
        ...baseParams,
        mode: 'double',
        sear1Sec: s1,
        rest1Sec,
        sear2Sec: s2,
        rest2Sec,
      });
      const diff = Math.abs(sim.maxCoreTemp - targetTemp);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestTotalSear = mid;
      }
      if (sim.maxCoreTemp < targetTemp) {
        lo = mid + 5;
      } else {
        hi = mid - 5;
      }
    }

    const sear1Sec = round15(bestTotalSear * 0.74);
    const sear2Sec = round15(Math.max(45, bestTotalSear - sear1Sec));

    return {
      sear1Sec,
      rest1Sec,
      sear2Sec,
      rest2Sec,
    };
  }
}
