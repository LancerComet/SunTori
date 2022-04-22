/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')
const { generate } = require('../dist')

describe('Generator testing.', () => {
  it('Should generate codes correctly.', () => {
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

    const result = generate({
      jsonObject: json,
      rootClassName: 'User'
    })

    const correctResult = fs.readFileSync(
      path.resolve(__dirname, './result.ts'),
      { encoding: 'utf-8' }
    )
    expect(result).toBe(correctResult)
  })
})
