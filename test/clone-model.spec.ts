import 'reflect-metadata'

import { cloneModel } from '../lib'
import { deserialize, JsonProperty, Serializable } from '../lib'

it('cloneModel', () => {
  @Serializable()
  class User {
    @JsonProperty()
    readonly name: string = ''

    @JsonProperty()
    readonly age: number = 0

    get doubleAge () {
      return this.age * 2
    }
  }

  const user = deserialize({ name: 'test', age: 100 }, User)
  const userClone = cloneModel(user)

  expect(user.constructor).toBe(userClone.constructor)
  expect(user === userClone).toBe(false)

  expect(userClone.name).toBe('test')
  expect(userClone.age).toBe(100)
  expect(userClone.doubleAge).toBe(200)

  expect(cloneModel(null)).toBe(null)
  expect(cloneModel(undefined)).toBe(null)
})
