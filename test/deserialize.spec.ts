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

  it('DataSource 返回 null 时应当正确处理: null 不做处理.', () => {
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
    class Response {
      @JsonProperty({
        type: User,
        name: 'user_list'
      })
      userList: User[] = [userInstance]

      @JsonProperty('user')
      user: User = new User()
    }

    const result = deserialize({
      user_list: null,
      user: null
    }, Response)

    expect(result).toEqual({
      userList: [userInstance],
      user: null
    })
  })

  it('DataSource 返回 null 时应当正确处理: 将 null 反序列化为默认值.', () => {
    const date = new Date()

    @Serializable({
      isDeserializeNull: true
    })
    class User1 {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = date
    }

    @Serializable()
    class User2 {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty()
      date: Date = date
    }

    const user1Instance = deserialize(null, User1)
    expect(user1Instance.name).toBe('')
    expect(user1Instance.age).toBe(0)
    expect(user1Instance.date).toBe(date)

    const user2Instance = deserialize(null, User2)
    expect(user2Instance).toBe(null)

    @Serializable()
    class ResponseData {
      @JsonProperty({
        type: User1,
        name: 'user_list',
        isDeserializeNull: true
      })
      userList: User1[] = [user1Instance]

      @JsonProperty({
        name: 'user1a',
        type: User1,
        isDeserializeNull: true
      })
      user1a: User1 = new User1()

      // 因为 User1 在 Serializable 中声明了 isDeserializeNull,
      // 所以这里不在 JsonProperty 中声明 isDeserializeNull, 也会创建默认值.
      @JsonProperty('user1b')
      user1b: User1 = new User1()

      @JsonProperty('user2')
      user2: User2 = new User2()
    }

    const result = deserialize({
      user_list: null,
      user1a: null,
      user1b: null,
      user2: null
    }, ResponseData)

    expect(result).toEqual({
      userList: [user1Instance],
      user1a: user1Instance,
      user1b: user1Instance,
      user2: null
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
