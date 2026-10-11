import { useState } from 'react'

// 仮のカード名（あとで自分のデッキに置き換える）
const DECK = ['カードA', 'カードB', 'カードC', 'カードD', 'カードE', 'カードF']

// 手札のカードの型定義
// name: カード名、returned: 返却するかどうか
type HandCard = {
  name: string
  returned: boolean
}

function App() {
  // 手札：HandCardの配列。最初は空
  const [hand, setHand] = useState<HandCard[]>([])

  const addToHand = (name: string) => {
    if (hand.length >= 4) return // 初期手札は4枚まで
    setHand([...hand, { name, returned: false }])
  }

  const toggleReturned = (index: number) => {
    setHand(hand.map((card, i) => (i === index ? { ...card, returned: !card.returned } : card)))
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
      <h2>RETURN</h2>
      <ul>
        {hand.filter((card) => card.returned).map((card, i) => (
          <li key={i}>{card.name}</li>
        ))}
      </ul>

      <button onClick={() => setHand([])}>reset</button>
    </div>
  )
}

export default App