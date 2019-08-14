import { deepClone } from '../../lib/utils/deep-clone'

describe('Deep clone testing.', () => {
  it('Should clone string correctly.', () => {
    const target = 'LancerComet'
    expect(deepClone(target)).toBe(target)
  })

  it('Should clone number correctly.', () => {
    const target = 10
    expect(deepClone(target)).toBe(target)
  })

  it('Should clone array correctly.', () => {
    const obj = { name: 'LancerComet' }
    const target = [1, '2', obj]
    const result = deepClone(target)
    expect(result).toEqual(target)
    expect(result[2] === obj).toBe(false)
    expect(result === target).toBe(false)
    target[0] = 10
    expect(result[0]).toEqual(1)
  })

  it('Should clone object correctly.', () => {
    const target = { name: 'LancerComet' }
    const result = deepClone(target)
    expect(result).toEqual(target)
    expect(result === target).toEqual(false)
    target.name = 'Wch'
    expect(result.name).toBe('LancerComet')
  })

  it('Should clone function correctly.', () => {
    function test (age: number) {
      return this.username + ', ' + age
    }

    const clone = deepClone(test)
    const context = { name: 'Wch' }
    expect(clone === test).toEqual(false)
    expect(test.call(context, 10)).toEqual(clone.call(context, 10))
  })
})
