import 'reflect-metadata'
import { deserialize, JsonProperty, Serializable } from '../lib'

describe('deserialize 测试.', () => {
  it('应当正确序列化一个简单类型', () => {
    @Serializable()
    class Address {
      @JsonProperty('label')
      label: string = ''

      @JsonProperty('the_address')
      address: string = ''
    }

    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = new Date()

      @JsonProperty('address')
      address: Address = new Address()
    }

    const instance = deserialize({
      name: 'LancerComet',
      age: 100,
      date: '1926-08-17 00:00:00',
      address: {
        label: 'the heaven',
        the_address: 'above the sky'
      }
    }, User)

    expect(instance.name).toBe('LancerComet')
    expect(instance.age).toBe(100)
    expect(instance.address).toEqual({
      label: 'the heaven',
      address: 'above the sky'
    })
  })

  it('应当正确处理不同的数据源键名', () => {
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

  it('应当能正确处理嵌套模型.', () => {
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

  it('应当正确处理继承.', () => {
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

  it('DataSource 返回 null 时应当正确处理.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = new Date()
    }

    const userInstance = deserialize(null, User)
    expect(userInstance).toBe(null)

    @Serializable()
    class UserList {
      @JsonProperty({
        type: User,
        name: 'user_list'
      })
      userList: User[] = [userInstance]
    }

    const result = deserialize({
      user_list: null
    }, UserList)

    expect(result).toEqual({
      userList: [userInstance]
    })
  })

  it('DataSource 返回 undefined 时应当正确处理.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = new Date()
    }

    const userInstance = deserialize(undefined, User)
    expect(userInstance).toBe(null)

    @Serializable()
    class UserList {
      @JsonProperty({
        type: User,
        name: 'user_list'
      })
      userList: User[] = [userInstance]
    }

    const result = deserialize({
      user_list: undefined
    }, UserList)

    expect(result).toEqual({
      userList: [userInstance]
    })
  })
})
