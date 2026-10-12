import { useState, useEffect } from 'react'
import type { HandCard, Turn, MulliganRecord, OpponentClass } from './types'
import { CLASSES } from './types'
import { calcWinRate, calcWinRateByClass } from './stats'
import { loadRecords, saveRecords } from './storage'

// 仮のカード名（あとで自分のデッキに置き換える）
const DECK = ['カードA', 'カードB', 'カードC', 'カードD', 'カードE', 'カードF']
// 先行・後攻のラベル
const TURN_LABEL: Record<Turn, string> = { first: '先攻', second: '後攻' }
// 勝敗のラベル
const RESULT_LABEL: Record<'win' | 'lose' | 'null', string> = { win: '勝ち', lose: '負け', null: '未入力' }

function App() {
  // 手札：HandCardの配列。最初は空
  const [hand, setHand] = useState<HandCard[]>([])

  // 先行・後攻の選択肢
  const [turn, setTurn] = useState<Turn | null>(null)

  // 対戦相手のクラスの選択肢
  const [opponentClass, setOpponentClass] = useState<OpponentClass | null>(null)

  // マリガンの記録
  const [records, setRecords] = useState<MulliganRecord[]>(loadRecords())

  // recordsが更新されるたびにローカルストレージに保存する
  useEffect(() => {
    saveRecords(records)
  }, [records])

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
    if (turn === null || hand.length < 4 || opponentClass === null) return
    setRecords([...records, { hand, turn, opponentClass, result: null }])
    setHand([]) // 手札をリセット
    setTurn(null) // 先行・後攻の選択をリセット
    setOpponentClass(null) // 対戦相手のクラスの選択をリセット
  }

  // マリガンの結果を記録する関数
  const recordResult = (result: MulliganRecord['result'], index: number) => {
    setRecords(records.map((record, i) => (i === index ? { ...record, result } : record)))
  }

  const overallStats = calcWinRate(records)
  const byClassStats = calcWinRateByClass(records)

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

      <select value={opponentClass ?? ''} onChange={(e) => setOpponentClass(e.target.value as OpponentClass)}>
        <option value="" disabled>対戦相手のクラスを選択</option>
        {CLASSES.map((cls) => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      <button onClick={recordMulligan} disabled={turn === null || hand.length < 4 || opponentClass === null}>マリガンの記録</button>

      <h2>集計</h2>
      {(() => {
        return (
          <div>
            <p>
              記録 {overallStats.decided} 件 / 勝ち {overallStats.wins} / 負け {overallStats.losses} / 勝率 {overallStats.winRate === null ? '-' : `${overallStats.winRate}%`}
            </p>
            <h3>対戦相手のクラス別集計</h3>
            <table>
              <thead>
                <tr>
                  <th>クラス</th>
                  <th>結果入力済みの記録</th>
                  <th>勝ち</th>
                  <th>負け</th>
                  <th>勝率</th>
                </tr>
              </thead>
              <tbody>
                {byClassStats.map((stats) => (
                  <tr key={stats.cls}>
                    <td>{stats.cls}</td>
                    <td>{stats.decided}</td>
                    <td>{stats.wins}</td>
                    <td>{stats.losses}</td>
                    <td>{stats.winRate === null ? '-' : `${stats.winRate}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })()}

      <h2>マリガンの記録一覧</h2>
      <ul>
        {records.map((record, i) => (
          <li key={i}>
            {TURN_LABEL[record.turn]} / 対戦相手: {record.opponentClass} / KEEP: {record.hand.filter((card) => !card.returned).map((card) => card.name).join(', ')} / CHANGE: {record.hand.filter((card) => card.returned).map((card) => card.name).join(', ')} / 結果: {RESULT_LABEL[record.result ?? 'null']}
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