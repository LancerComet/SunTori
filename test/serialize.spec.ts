import 'reflect-metadata'

import { deserialize, JsonIgnore, JsonProperty, Serializable, serialize } from '../lib'

describe('Serialization testing.', () => {
  it('No error should be thrown while serializing.', () => {
    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty('user_address')
      @JsonIgnore()
      address: string = ''
    }

    const instance = deserialize({
      name: 'LancerComet',
      age: 100,
      user_address: 'The Mars.'
    }, User)

    expect(instance.name).toBe('LancerComet')
    expect(instance.age).toBe(100)
    expect(instance.address).toBe('The Mars.')

    const json = serialize(instance)
    expect(JSON.stringify(json)).toBe('{"name":"LancerComet","age":100}')
  })

  it('non-@Serializable object should not be serialized.', () => {
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty('user_address')
      @JsonIgnore()
      address: string = ''
    }

    const instance = deserialize({
      name: 'LancerComet',
      age: 100,
      user_address: 'The Mars.'
    }, User)

    const json = serialize(instance)
    expect(json).toEqual({})
  })

  it('Array-typed data should be serialized in correct.', () => {
    @Serializable()
    class Book {
      @JsonProperty()
      name: string = ''

      @JsonProperty('book_pages')
      @JsonIgnore()
      pages: number = 0
    }

    @Serializable()
    class User {
      @JsonProperty()
      name: string = ''

      @JsonProperty()
      age: number = 0

      @JsonProperty('user_address')
      @JsonIgnore()
      address: string = ''

      @JsonProperty({
        name: 'books',
        type: Book
      })
      books: Book[] = []
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
      users: [
        {
          name: 'LancerComet',
          age: 100,
          user_address: 'The Mars.',
          books: [
            { name: 'Book 1', book_pages: 10 },
            { name: 'Book 2', book_pages: 20 },
            { name: 'Book 3', pages: 30 }
          ]
        },
        {
          name: 'John Smith',
          age: 200,
          user_address: 'Heaven.'
        }
      ]
    }, UserList)

    const source = serialize(instance)
    const target = {
      users: [
        {
          name: 'LancerComet',
          age: 100,
          books: [
            { name: 'Book 1' },
            { name: 'Book 2' },
            { name: 'Book 3' }
          ]
        },
        {
          name: 'John Smith',
          age: 200,
          books: []
        }
      ]
    }

    expect(source).toEqual(target)
  })

  it('Props name should be matched correctly.', () => {
    @Serializable()
    class Book {
      @JsonProperty('book_name')
      name: string = ''

      @JsonProperty('book_pages')
      pages: number = 0

      @JsonProperty()
      author: string = 'winnie'
    }

    const serverData = {
      book_name: 'He has changed China.',
      book_pages: 114514,
      author: 'elder'
    }

    const instance = deserialize(serverData, Book)
    const source = serialize(instance)
    expect(source).toEqual(serverData)
  })
})
