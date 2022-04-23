import fs from 'fs'
import path from 'path'
import { generate } from '../lib'

describe('Generator testing.', () => {
  const json = {
    name: 'John Smith',
    age: 200,
    is_dead: true,
    addresses: [
      {
        name: 'Home',
        location: 'The Earth'
      },
      {
        name: 'Work',
        location: 'The Mars'
      }
    ],
    title: null,
    meta: {
      leaveTimes: 1,
      dates: []
    },
    ranks: [1, 2, 4]
  }

  it('Should generate codes correctly.', async () => {
    const result = await generate({
      jsonObject: json,
      rootClassName: 'User'
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './assets/normal.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })

  it('With readonly.', async () => {
    const result = await generate({
      jsonObject: json,
      rootClassName: 'User',
      addReadonly: true
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './assets/readonly.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })

  it('CamelCase disabled.', async () => {
    const result = await generate({
      jsonObject: json,
      rootClassName: 'User',
      useCamelCase: false
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './assets/no-camel-case.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })
})
