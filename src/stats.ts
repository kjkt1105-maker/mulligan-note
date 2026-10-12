import type { MulliganRecord } from './types'
import { CLASSES } from './types'

export function calcWinRate(records: MulliganRecord[]) {
  const decidedRecords = records.filter((r) => r.result !== null)
  const wins = decidedRecords.filter((r) => r.result === 'win').length
  const decided = decidedRecords.length
  const losses = decided - wins
  const winRate = decided > 0 ? Math.round((wins / decided) * 100) : null
  return { decided, wins, losses, winRate } // decided は件数（number）
}

export function calcWinRateByClass(records: MulliganRecord[]) {
  // 対戦相手のクラスごとの集計を返す
  // { cls: string; decided: number; wins: number; losses: number; winRate: number | null }
  return CLASSES.map((cls) => {
    const rs = records.filter((r) => r.opponentClass === cls)
    const { decided, wins, losses, winRate } = calcWinRate(rs)
    return { cls, decided, wins, losses, winRate }
  })
}