import { formatISBN } from './metadata'

describe('formatISBN', () => {
  it('should format correctly', () => {
    expect(formatISBN(60541873)).toBe('0060541873')
  })
})