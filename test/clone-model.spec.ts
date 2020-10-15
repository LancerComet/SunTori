import 'reflect-metadata'

import { cloneModel } from '../lib'
import { deserialize, JsonProperty, Serializable } from '../lib'

describe('cloneModel testing.', () => {
  it('cloneModel should work.', () => {
    @Serializable()
    class Example {
      @JsonProperty()
      readonly name: string = ''

      @JsonProperty()
      readonly age: number = 0

      get doubleAge () {
        return this.age * 2
      }
    }

    const example = deserialize({ name: 'test', age: 100 }, Example)
    const exampleClone = cloneModel(example)

    expect(example.constructor).toBe(exampleClone.constructor)
    expect(example === exampleClone).toBe(false)

    expect(exampleClone.name).toBe('test')
    expect(exampleClone.age).toBe(100)
    expect(exampleClone.doubleAge).toBe(200)

    expect(cloneModel(null)).toBe(null)
    expect(cloneModel(undefined)).toBe(null)
  })
})
