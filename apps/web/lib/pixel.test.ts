import { describe, expect, it } from 'vitest'
import { pixelHeaders, transparentGif } from './pixel'

describe('tracking pixel response', () => {
  it('is a non-cacheable GIF', () => {
    expect(transparentGif.byteLength).toBeGreaterThan(0)
    expect(pixelHeaders['Content-Type']).toBe('image/gif')
    expect(pixelHeaders['Cache-Control']).toContain('no-store')
  })
})
