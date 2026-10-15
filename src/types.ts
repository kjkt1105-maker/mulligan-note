// 手札のカードの型定義
// name: カード名、returned: 返却するかどうか
export type HandCard = {
  name: string
  returned: boolean
}

// 先行・後攻の型定義
export type Turn = 'first' | 'second'

// マリガンの記録の型定義
export type MulliganRecord = {
  hand: HandCard[]
  turn: Turn
  opponentClass: OpponentClass
  result: 'win' | 'lose' | null
}

export function isMulliganRecord(value: unknown): value is MulliganRecord {
  if (typeof value !== 'object' || value === null) return false
  const record = value as MulliganRecord
  return (
    (Array.isArray(record.hand) && record.hand.every((card): card is HandCard => typeof card === 'object' && card !== null && typeof card.name === 'string' && typeof card.returned === 'boolean')) &&
    (record.turn === 'first' || record.turn === 'second') &&
    CLASSES.includes(record.opponentClass) &&
    (record.result === 'win' || record.result === 'lose' || record.result === null)
  )
}

// 対戦相手のクラスの型定義
export const CLASSES = ['エルフ', 'ロイヤル', 'ウィッチ', 'ドラゴン', 'ナイトメア', 'ビショップ', 'ネメシス'] as const
export type OpponentClass = (typeof CLASSES)[number]

export type RecordFilter = {
  opponentClass?: OpponentClass
  turn?: Turn
}
