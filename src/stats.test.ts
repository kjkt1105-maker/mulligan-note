import { describe, it, expect } from 'vitest'
import { calcWinRate, calcWinRateByClass } from './stats'
import type { MulliganRecord } from './types'

// テスト用の記録を作る関数（必要な項目だけ上書きできる）
const makeRecord = (overrides: Partial<MulliganRecord> = {}): MulliganRecord => ({
  hand: [],
  turn: 'first',
  opponentClass: 'エルフ',
  result: null,
  ...overrides,
})

describe('calcWinRate', () => {
  it('記録が0件のとき、勝率は null', () => {
    expect(calcWinRate([]).winRate).toBeNull()
  })

  it('1勝2敗のとき、勝率は33%', () => {
    const records = [
      makeRecord({ result: 'win' }),
      makeRecord({ result: 'lose' }),
      makeRecord({ result: 'lose' }),
    ]
    expect(calcWinRate(records)).toEqual({ decided: 3, wins: 1, losses: 2, winRate: 33 })
  })

  it('結果が未入力の記録は、勝率の計算に含まれない', () => {
    const records = [
      makeRecord({ result: 'win' }),
      makeRecord({ result: 'lose' }),
      makeRecord({ result: null }),
    ]
    expect(calcWinRate(records).winRate).toBe(50)
  })

})

describe('calcWinRateByClass', () => {
  it('記録が0件のとき、全クラスの勝率は null', () => {
    const stats = calcWinRateByClass([])
    expect(stats.every((s) => s.winRate === null)).toBe(true)
  })

  it('calcWinRateByClass が、記録のないクラスも含めて7件返し、そのクラスの勝率が null', () => {
    const records = [
      makeRecord({ opponentClass: 'エルフ', result: 'win' }),
      makeRecord({ opponentClass: 'ロイヤル', result: 'lose' }),
    ]
    const stats = calcWinRateByClass(records)
    expect(stats.length).toBe(7)
    for (const cls of ['エルフ', 'ロイヤル']) {
      expect(stats.find((s) => s.cls === cls)).not.toBeNull()
    }
    for (const cls of ['ウィッチ', 'ドラゴン', 'ナイトメア', 'ビショップ', 'ネメシス'] as const) {
      expect(stats.find((s) => s.cls === cls)?.winRate).toBeNull()
    }
  })

  it('calcWinRateByClass が、クラスごとに正しく分けて数える', () => {
    const records = [
      makeRecord({ opponentClass: 'エルフ', result: 'win' }),
      makeRecord({ opponentClass: 'エルフ', result: 'lose' }),
      makeRecord({ opponentClass: 'ロイヤル', result: 'win' }),
      makeRecord({ opponentClass: 'ロイヤル', result: 'win' }),
      makeRecord({ opponentClass: 'ロイヤル', result: 'lose' }),
    ]
    const stats = calcWinRateByClass(records)
    expect(stats.find((s) => s.cls === 'エルフ')).toEqual({ cls: 'エルフ', decided: 2, wins: 1, losses: 1, winRate: 50 })
    expect(stats.find((s) => s.cls === 'ロイヤル')).toEqual({ cls: 'ロイヤル', decided: 3, wins: 2, losses: 1, winRate: 67 })
  })
})