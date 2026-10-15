export function addCard(deck: string[], name: string): string[] {
  // 前後の空白を除く。空文字、すでに登録済みの名前は追加しない
  const trimmedName = name.trim()
  console.log('addCard called with name:', name, 'trimmedName:', trimmedName, 'deck:', deck)
  if (trimmedName === '' || deck.includes(trimmedName)) {
    console.log('addCard: not adding card, returning original deck')
    return deck
  }
  console.log('addCard: adding card, returning updated deck')
  return [...deck, trimmedName]
}

export function removeCard(deck: string[], name: string): string[] {
  console.log('removeCard called with name:', name, 'deck:', deck)
  return deck.filter((card) => card !== name)
}