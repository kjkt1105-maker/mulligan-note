import type { MulliganRecord } from './types'
import { isMulliganRecord } from './types'

export function loadRecords(): MulliganRecord[] {
  const savedRecords = localStorage.getItem('mulliganRecords')
  if (savedRecords) {
    try {
      const parsedRecords = JSON.parse(savedRecords)
      if (Array.isArray(parsedRecords)) {
        return parsedRecords.filter(isMulliganRecord) // 型ガードでフィルタリング
      }
    } catch (e) {
      console.error('Failed to parse mulligan records from localStorage', e)
    }
  }
  return []
}
export function saveRecords(records: MulliganRecord[]): void {
  localStorage.setItem('mulliganRecords', JSON.stringify(records))
}