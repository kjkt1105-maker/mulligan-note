import type { MulliganRecord, OpponentClass, Turn, RecordFilter } from './types'
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

export function calcWinRateByKeptCard(records: MulliganRecord[]) {
  // カード名ごとに { name, decided, wins, losses, winRate } を返す
  // 処理
  // 1. マリガンレコードの配列から一つのマリガンレコードを取り出す
  // 2. そのマリガンレコードの hand の配列から返却しなかったカードを取り出す
  // 3. そのカード名をキーにして、Map にマリガンレコードを追加する
  // 4. Map の各エントリについて、calcWinRate を呼び出して集計する

  const cardMap = new Map<string, MulliganRecord[]>()
  for (const record of records) {
    if (record.result === null) continue // 結果が未入力の記録は無視
    const seenCards = new Set<string>() // 1つの記録内で同じカード名が複数ある場合は1回だけカウントするためのセット
    for (const card of record.hand) {
      if (!card.returned && !seenCards.has(card.name)) {
        seenCards.add(card.name)
        const list = cardMap.get(card.name) ?? []
        list.push(record)
        cardMap.set(card.name, list)
      }
    }
  }
  return Array.from(cardMap.entries()).map(([name, rs]) => {
    const { decided, wins, losses, winRate } = calcWinRate(rs)
    return { name, decided, wins, losses, winRate }
  })
}

export function filterRecords(records: MulliganRecord[], filter: RecordFilter) : MulliganRecord[] {
  // 指定された条件に合う記録だけを返す。条件が未指定なら、その条件では絞り込まない
  return records.filter((r) => {
    // opponentClass と turn の両方が指定されていない場合は、全件返す
    // opponentClass が指定されている場合は、そのクラスの記録だけを返す
    if (filter.opponentClass && r.opponentClass !== filter.opponentClass) return false
    // turn が指定されている場合は、そのターンの記録だけを返す
    if (filter.turn && r.turn !== filter.turn) return false
    return true
  })
}