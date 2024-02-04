import 'reflect-metadata'
import { deserialize, DynamicKey, JsonProperty, JsonString, Nullable, ParseFloat, ParseInt, Serializable } from '../lib'

describe('Deserialization testing.', () => {
  it('A simple deserialization should work properly.', () => {
    @Serializable()
    class Address {
      @JsonProperty('label')
        label = ''

      @JsonProperty('the_address')
        address = ''
    }

    @Serializable()
    class User {
      @JsonProperty()
        name = ''

      @JsonProperty()
        age = 0

      @JsonProperty()
        date: Date = new Date()

      @JsonProperty('address')
        address: Address = new Address()

      @JsonProperty('authors')
        authors: string[] = []
    }

    const instance = deserialize({
      name: 'LancerComet',
      age: 100,
      date: '1926-08-17 00:00:00',
      address: {
        label: 'the heaven',
        the_address: 'above the sky'
      },
      authors: [
        'John Smith'
      ]
    }, User)

    expect(instance.name).toBe('LancerComet')
    expect(instance.age).toBe(100)
    expect(instance.address).toEqual({
      label: 'the heaven',
      address: 'above the sky'
    })
    expect(instance.authors).toEqual(['John Smith'])
  })

  it('Prop mapping should work properly.', () => {
    @Serializable()
    class User {
      @JsonProperty()
        name = ''

      @JsonProperty('user_age')
        age = 0

      @JsonProperty('user_address')
        address = 'Default address'
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

  it('Nested-type should work properly.', () => {
    @Serializable()
    class User {
      @JsonProperty()
        name = ''

      @JsonProperty('user_age')
        age = 0

      @JsonProperty('user_address')
        address = ''
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

  it('Inheritance should be handled properly.', () => {
    @Serializable()
    class Creature {
      @JsonProperty('user_age')
        age = 0
    }

    @Serializable()
    class Person extends Creature {
      @JsonProperty()
        name = ''
    }

    @Serializable()
    class User extends Person {
      @JsonProperty('user_address')
        address = ''
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

  it('Null payload should be handled properly.', () => {
    @Serializable()
    class User {
      @JsonProperty()
        name = ''

      @JsonProperty()
        age = 0

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

  it('Undefined should be handled properly.', () => {
    @Serializable()
    class User {
      @JsonProperty()
        name = ''

      @JsonProperty()
        age = 0

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

  it('Fallback value should be returned when incorrect array-typed received.', () => {
    @Serializable()
    class Person {
      @JsonProperty()
        name = ''

      constructor (name) {
        this.name = name
      }
    }

    @Serializable()
    class Country {
      @JsonProperty('chair_man')
        chairman: Person = new Person('WINNIE')
    }

    const correctInstance = deserialize({
      chair_man: {
        name: 'WINNIE_THE_POOH'
      }
    }, Country)

    expect(correctInstance).toEqual({
      chairman: {
        name: 'WINNIE_THE_POOH'
      }
    })

    const errorInstance = deserialize({
      chair_man: [{
        name: 'WINNIE'
      }, {
        name: 'HAHA'
      }]
    }, Country)

    expect(errorInstance).toEqual({
      chairman: {
        name: 'WINNIE'
      }
    })
  })

  it('@JsonString should work properly.', () => {
    @Serializable()
    class Sub {
      @JsonProperty('a_ee')
        aEe = 0

      @JsonProperty('b_cii')
        bCii = 0
    }

    @Serializable()
    class Params {
      @JsonProperty()
        c = 0

      @JsonProperty()
        d = 0
    }

    @Serializable()
    class A {
      @JsonProperty('sub_data')
        subData: Sub = new Sub()

      @JsonProperty()
      @JsonString()
        params: Params = new Params()

      @JsonProperty()
      @JsonString()
        paramsB: Params = new Params()

      @JsonProperty('params_c')
      @JsonString()
        paramsC: Params = new Params()

      @JsonProperty('params_d')
      @JsonString()
        paramsD: Params = new Params()

      @JsonProperty({
        type: Params,
        name: 'paramsE'
      })
        paramsE: Params[] = [new Params()]

      @JsonProperty({
        type: Params,
        name: 'paramsF'
      })
      @JsonString()
        paramsF: Params[] = []

      @JsonProperty('num')
        allNum = 0
    }

    const a = deserialize({
      sub_data: { a_ee: 10, b_cii: 20 },
      params: '{ "c": 100, "d": 200 }',
      parmsB: [],
      params_c: '{ "c": 101, "d": 202 }',
      params_d: { c: 102, d: 103 },
      paramsE: JSON.stringify([
        { c: 1, d: 2 }, { c: 3, d: 4 }
      ]),
      paramsF: JSON.stringify([
        { c: 1, d: 2 }, { c: 3, d: 4 }
      ]),
      num: 100
    }, A)

    expect(a).toEqual({
      subData: { aEe: 10, bCii: 20 },
      params: { c: 100, d: 200 },
      paramsB: { c: 0, d: 0 },
      paramsC: { c: 101, d: 202 },
      paramsD: { c: 102, d: 103 },
      paramsE: [{ c: 0, d: 0 }],
      paramsF: [{ c: 1, d: 2 }, { c: 3, d: 4 }],
      allNum: 100
    })
  })

  it('@DynamicKey should work properly.', () => {
    @Serializable()
    class A {
      @JsonProperty()
        a = ''
    }

    @Serializable()
    class B {
      @JsonProperty({
        name: 'as',
        type: A
      })
      @DynamicKey()
        as: { [key: string]: A } = {}
    }

    const b = deserialize({
      as: {
        a: { a: '1' },
        b: { a: '2' },
        c: { a: '3' }
      }
    }, B)

    expect(b).toEqual({
      as: {
        a: { a: '1' },
        b: { a: '2' },
        c: { a: '3' }
      }
    })
  })

  it('@Nullable should work properly.', () => {
    @Serializable()
    class SubA {
      @JsonProperty()
      readonly a: string = ''

      @JsonProperty()
      @Nullable()
      readonly b: number = 0
    }

    @Serializable()
    class A {
      @JsonProperty()
      readonly num: number = 0

      @JsonProperty()
      @Nullable()
      readonly numNullable: number = 0

      @JsonProperty()
      @Nullable()
      readonly numNullable2: number = 0

      @JsonProperty()
      readonly subA: SubA = new SubA()

      @JsonProperty()
      @Nullable()
      readonly subANullable: SubA = new SubA()
    }

    const result = deserialize({
      num: null,
      numNullable: null,
      numNullable2: '',
      subA: null,
      subANullable: null
    }, A)

    expect(result).toEqual({
      num: 0,
      numNullable: null,
      numNullable2: 0,
      subA: {
        a: '',
        b: 0
      },
      subANullable: null
    })
  })

  it('@ParseInt and @ParseFloat should work properly.', () => {
    @Serializable()
    class Test {
      @JsonProperty()
      @ParseInt()
      readonly int: number = 1

      @JsonProperty()
      @ParseFloat()
      readonly float: number = 0.1
    }

    expect(deserialize({ int: '10', float: '10.12' }, Test)).toEqual({ int: 10, float: 10.12 })
    expect(deserialize({ int: '-10', float: '-10.12' }, Test)).toEqual({ int: -10, float: -10.12 })
    expect(deserialize({ int: '20.1', float: '-100' }, Test)).toEqual({ int: 20, float: -100 })

    // Checking fallback.
    expect(deserialize({ int: 'abc', float: 'def' }, Test)).toEqual({ int: 1, float: 0.1 })
    expect(deserialize({ int: [], float: () => 100 }, Test)).toEqual({ int: 1, float: 0.1 })
  })
})
