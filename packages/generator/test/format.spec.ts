import { codeFormat } from '../lib/format'
import fs from 'fs'
import path from 'path'

describe('Formatter testing.', () => {
  const originalCode = fs.readFileSync(
    path.resolve(__dirname, './assets/original.ts'),
    { encoding: 'utf-8' }
  )

  const resultNormal = fs.readFileSync(
    path.resolve(__dirname, './assets/normal.ts'),
    { encoding: 'utf-8' }
  )

  it('Should format code correctly.', () => {
    const result = codeFormat(originalCode)
    expect(result).toBe(resultNormal)
  })
})
