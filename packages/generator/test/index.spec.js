/* eslint-disable @typescript-eslint/no-var-requires,no-undef */
const fs = require('fs')
const path = require('path')
const { generate } = require('../dist')

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

  it('Should generate codes correctly.', () => {
    const result = generate({
      jsonObject: json,
      rootClassName: 'User'
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './normal.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })

  it('With readonly.', () => {
    const result = generate({
      jsonObject: json,
      rootClassName: 'User',
      addReadonly: true
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './readonly.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })

  it('CamelCase disabled.', () => {
    const result = generate({
      jsonObject: json,
      rootClassName: 'User',
      useCamelCase: false
    })
    const expected = fs.readFileSync(
      path.resolve(__dirname, './no-camel-case.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(expected)
  })
})
