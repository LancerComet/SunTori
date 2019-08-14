import 'reflect-metadata'
import { deserialize, JsonProperty, Serializable } from '../lib'

describe('Deserialization testing.', () => {
  it('No error should be thrown while deserializing.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = new Date()
    }

    const instance = deserialize({
      name: 'LancerComet',
      age: 100,
      date: '1926-08-17 00:00:00'
    }, User)

    expect(instance.name).toBe('LancerComet')
    expect(instance.age).toBe(100)
  })

  it('Props name should be matched correctly.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty('user_age')
      age: number = 0

      @JsonProperty('user_address')
      address: string = 'Default address'
    }

    const instance = deserialize({
      name: 'LancerComet',
      user_age: 100,
      wrong_address: 'The Mars.'
    }, User)

    expect(instance.name).toBe('LancerComet')
    expect(instance.age).toBe(100)
    expect(instance.address).toBe('Default address')
  })

  it('Array-typed data should be deserialized in correct.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty('user_age')
      age: number = 0

      @JsonProperty('user_address')
      address: string = ''
    }

    @Serializable()
    class UserList {
      @JsonProperty({
        name: 'users',
        type: User
      })
      users: User[] = []
    }

    const instance = deserialize({
      users: [{
        name: 'LancerComet',
        user_age: 100,
        user_address: 'The Mars.'
      }, {
        name: 'John Smith',
        user_age: 200,
        user_address: 'Heaven.'
      }]
    }, UserList)

    expect(instance).toEqual({
      users: [
        { name: 'LancerComet', age: 100, address: 'The Mars.' },
        { name: 'John Smith', age: 200, address: 'Heaven.' }
      ]
    })
  })

  it('All props should be inherited in correct.', () => {
    @Serializable()
    class Creature {
      @JsonProperty('user_age')
      age: number = 0
    }

    @Serializable()
    class Person extends Creature {
      @JsonProperty()
      name: string = ''
    }

    @Serializable()
    class User extends Person {
      @JsonProperty('user_address')
      address: string = ''
    }

    const instance = deserialize({
      name: 'LancerComet',
      user_age: 100,
      user_address: 'The Mars.'
    }, User)

    expect(instance).toEqual({
      name: 'LancerComet',
      age: 100,
      address: 'The Mars.'
    })
  })
})
