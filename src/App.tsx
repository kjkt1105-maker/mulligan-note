import { useState } from 'react'

// 仮のカード名（あとで自分のデッキに置き換える）
const DECK = ['カードA', 'カードB', 'カードC', 'カードD', 'カードE', 'カードF']

function App() {
  // 手札：文字列の配列。最初は空
  const [hand, setHand] = useState<string[]>([])

  const addToHand = (name: string) => {
    if (hand.length >= 4) return // 初期手札は4枚まで
    setHand([...hand, name])
  }

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
        {hand.map((name, i) => (
          <li key={i}>
            <button onClick={() => setHand(hand.filter((_, j) => j !== i))}>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App