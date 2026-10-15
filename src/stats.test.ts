import { describe, it, expect } from 'vitest'
import { calcWinRate, calcWinRateByClass, calcWinRateByKeptCard, filterRecords } from './stats'
import type { MulliganRecord } from './types'
import { addCard, removeCard } from './deck'

// テスト用の記録を作る関数（必要な項目だけ上書きできる）
const makeRecord = (overrides: Partial<MulliganRecord> = {}): MulliganRecord => ({
  hand: [
    { name: 'A', returned: false },
    { name: 'B', returned: false },
    { name: 'C', returned: false },
    { name: 'D', returned: false },
  ],
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

describe('calcWinRateByKeptCard', () => {
  it('記録が0件のとき、空の配列を返す', () => {
    const stats = calcWinRateByKeptCard([])
    expect(stats).toEqual([])
  })

  it('「A、B、C、Dをキープして勝った1件」→ 4種類のカードが、それぞれ1勝', () => {
    const records = [
      makeRecord({ hand: [{ name: 'カード1', returned: false }, { name: 'カード2', returned: false }, { name: 'カード3', returned: false }, { name: 'カード4', returned: false }], result: 'win' }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats).toEqual([
      { name: 'カード1', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'カード2', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'カード3', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'カード4', decided: 1, wins: 1, losses: 0, winRate: 100 },
    ])
  })

  it('「同じカードを2枚キープした1件」→ そのカードの decided が1になる', () => {
    const records = [
      makeRecord({ hand: [{ name: 'A', returned: false }, { name: 'A', returned: false }, { name: 'B', returned: false }, { name: 'C', returned: false }], result: 'win' }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats).toEqual([
      { name: 'A', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'B', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'C', decided: 1, wins: 1, losses: 0, winRate: 100 },
    ])
  })

  it('「返したカードは数えない」', () => {
    const records = [
      makeRecord({ hand: [{ name: 'A', returned: false }, { name: 'B', returned: true }, { name: 'C', returned: false }, { name: 'D', returned: false }], result: 'win' }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats).toEqual([
      { name: 'A', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'C', decided: 1, wins: 1, losses: 0, winRate: 100 },
      { name: 'D', decided: 1, wins: 1, losses: 0, winRate: 100 },
    ])
  })

  it('同じカードを複数の試合でキープしたとき、試合ごとに数える', () => {
    const records = [
      makeRecord({ result: 'win' }),
      makeRecord({ result: 'lose' }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats.find((s) => s.name === 'A')).toEqual({
      name: 'A', decided: 2, wins: 1, losses: 1, winRate: 50,
    })
  })

  it('結果が未入力の記録は数えない', () => {
    // 勝ち1件と、未入力1件で同じカードをキープ → decided は 1
    const records = [
      makeRecord({ result: 'win' }),
      makeRecord({ result: null }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats.find((s) => s.name === 'A')).toEqual({
      name: 'A', decided: 1, wins: 1, losses: 0, winRate: 100,
    })
  })

  it('未入力の記録でしかキープしていないカードは、一覧に出ない', () => {
    const records = [
      makeRecord({ result: null }),
    ]
    const stats = calcWinRateByKeptCard(records)
    expect(stats.find((s) => s.name === 'A')).toBeUndefined()
  })
})

describe('filterRecords', () => {
  it('条件が未指定なら、全件返す', () => {
    const records = [
      makeRecord({ result: 'win' }),
      makeRecord({ result: 'lose' }),
    ]
    const filtered = filterRecords(records, {})
    expect(filtered).toEqual(records)
  })

  it('opponentClass だけ指定したとき、そのクラスの記録だけを返す', () => {
    const records = [
      makeRecord({ result: 'win', opponentClass: 'エルフ' }),
      makeRecord({ result: 'lose', opponentClass: 'ロイヤル' }),
    ]
    const filtered = filterRecords(records, { opponentClass: 'エルフ' })
    expect(filtered).toEqual([records[0]])
  })

  it('turn だけ指定したとき、そのターンの記録だけを返す', () => {
    const records = [
      makeRecord({ result: 'win', turn: 'first' }),
      makeRecord({ result: 'lose', turn: 'second' }),
    ]
    const filtered = filterRecords(records, { turn: 'first' })
    expect(filtered).toEqual([records[0]])
  })

  it('opponentClass と turn の両方を指定したとき、両方に合致する記録だけを返す', () => {
    const records = [
      makeRecord({ result: 'win', opponentClass: 'エルフ', turn: 'first' }),
      makeRecord({ result: 'lose', opponentClass: 'エルフ', turn: 'second' }),
      makeRecord({ result: 'win', opponentClass: 'ロイヤル', turn: 'first' }),
    ]
    const filtered = filterRecords(records, { opponentClass: 'エルフ', turn: 'first' })
    expect(filtered).toEqual([records[0]])
  })
})

describe('addCard', () => {
  it('空文字は追加しない', () => {
    const deck = ['A', 'B']
    expect(addCard(deck, '')).toEqual(deck)
  })

  it('すでに登録されているカードは追加しない', () => {
    const deck = ['A', 'B']
    expect(addCard(deck, 'A')).toEqual(deck)
  })

  it('空白を含むカード名は前後の空白を除いて追加する', () => {
    const deck = ['A', 'B']
    expect(addCard(deck, ' C ')).toEqual(['A', 'B', 'C'])
  })

  it('addCard は、元の配列を書き換えない', () => {
    const deck = ['A']
    addCard(deck, 'B')
    expect(deck).toEqual(['A'])
  })
})

describe('removeCard', () => {
  it('存在しないカードは削除しない', () => {
    const deck = ['A', 'B']
    expect(removeCard(deck, 'C')).toEqual(deck)
  })

  it('存在するカードは削除する', () => {
    const deck = ['A', 'B']
    expect(removeCard(deck, 'B')).toEqual(['A'])
  })
})