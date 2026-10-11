import { useState } from 'react'

// 仮のカード名（あとで自分のデッキに置き換える）
const DECK = ['カードA', 'カードB', 'カードC', 'カードD', 'カードE', 'カードF']
// 先行・後攻のラベル
const TURN_LABEL: Record<Turn, string> = { first: '先攻', second: '後攻' }

const RESULT_LABEL: Record<'win' | 'lose' | 'null', string> = { win: '勝ち', lose: '負け', null: '未入力' }

// 手札のカードの型定義
// name: カード名、returned: 返却するかどうか
type HandCard = {
  name: string
  returned: boolean
}
// 先行・後攻の型定義
type Turn = 'first' | 'second'
// マリガンの記録の型定義
type MulliganRecord = {
  hand: HandCard[]
  turn: Turn
  result: 'win' | 'lose' | null
}

function App() {
  // 手札：HandCardの配列。最初は空
  const [hand, setHand] = useState<HandCard[]>([])

  // 先行・後攻の選択肢
  const [turn, setTurn] = useState<Turn | null>(null)

  // マリガンの記録
  const [records, setRecords] = useState<MulliganRecord[]>([])

  // デッキから手札にカードを追加する関数
  const addToHand = (name: string) => {
    if (hand.length >= 4) return // 初期手札は4枚まで
    setHand([...hand, { name, returned: false }])
  }

  // 手札のカードを返却するかどうかを切り替える関数
  const toggleReturned = (index: number) => {
    setHand(hand.map((card, i) => (i === index ? { ...card, returned: !card.returned } : card)))
  }

  // マリガンの記録を追加する関数
  const recordMulligan = () => {
    if (turn === null || hand.length < 4) return
    setRecords([...records, { hand, turn, result: null }])
    setHand([]) // 手札をリセット
    setTurn(null) // 先行・後攻の選択をリセット
  }

  // マリガンの結果を記録する関数
  const recordResult = (result: MulliganRecord['result'], index: number) => {
    setRecords(records.map((record, i) => (i === index ? { ...record, result } : record)))
  }
  const decided = records.filter((record) => record.result !== null)
  const wins = records.filter((record) => record.result === 'win').length
  const losses = decided.length - wins
  const winRate = decided.length > 0 ? Math.round((wins / decided.length) * 100) : null

  return (
    <div>
      <h1>マリガンノート</h1>

      <h2>デッキ</h2>
      {DECK.map((name) => (
        <button key={name} onClick={() => addToHand(name)} disabled={hand.length >= 4}>
          {name}
        </button>
      ))}

      <h2>手札（{hand.length}/4）</h2>
      <ul>
        {hand.map((card, i) => (
          <li key={i}>
            <button onClick={() => toggleReturned(i)} style={{ textDecoration: card.returned ? 'line-through' : 'none' }}>
              {card.name}
            </button>
          </li>
        ))}
      </ul>

      <h2>KEEP</h2>
      <ul>
        {hand.filter((card) => !card.returned).map((card, i) => (
          <li key={i}>{card.name}</li>
        ))}
      </ul>
      <h2>CHANGE</h2>
      <ul>
        {hand.filter((card) => card.returned).map((card, i) => (
          <li key={i}>{card.name}</li>
        ))}
      </ul>

      <select value={turn ?? ''} onChange={(e) => setTurn(e.target.value as Turn)}>
        <option value="" disabled>先攻・後攻を選択</option>
        <option value="first">先攻</option>
        <option value="second">後攻</option>
      </select>

      <button onClick={recordMulligan} disabled={turn === null || hand.length < 4}>マリガンの記録</button>

      <h2>集計</h2>
      <p>
        記録 {decided.length} 件 / 勝ち {wins} / 負け {losses} / 勝率 {winRate === null ? '-' : `${winRate}%`}
      </p>

      <h2>マリガンの記録一覧</h2>
      <ul>
        {records.map((record, i) => (
          <li key={i}>
            {TURN_LABEL[record.turn]} / KEEP: {record.hand.filter((card) => !card.returned).map((card) => card.name).join(', ')} / CHANGE: {record.hand.filter((card) => card.returned).map((card) => card.name).join(', ')} / 結果: {RESULT_LABEL[record.result ?? 'null']}
            {record.result === null ? (
              <>
                <button onClick={() => recordResult('win', i)}>勝ち</button>
                <button onClick={() => recordResult('lose', i)}>負け</button>
              </>
            ) : (
              <button onClick={() => recordResult(null, i)}>取り消し</button>
            )}
          </li>
        ))}
      </ul>

    </div>
  )
}

export default App