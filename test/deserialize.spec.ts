import 'reflect-metadata'
import { deserialize, JsonProperty, Serializable } from '../lib'

describe('Deserialize testing.', () => {
  const DEFAULT_DATE = new Date()

  interface IAddressDetail {
    postcode: number
    isExist: boolean
  }

  @Serializable()
  class Address {
    @JsonProperty('label')
    label: string = ''

    @JsonProperty('the_address')
    address: string = ''

    @JsonProperty()
    detail: IAddressDetail = {
      postcode: 0,
      isExist: false
    }
  }

  @Serializable()
  class Card {
    @JsonProperty()
    id: string = ''

    @JsonProperty()
    value: number = 0
  }

  @Serializable()
  class User {
    @JsonProperty()
    name: string = ''

    @JsonProperty()
    age: number = 0

    @JsonProperty()
    date: Date = DEFAULT_DATE

    @JsonProperty()
    books: string[] = []

    @JsonProperty({
      type: Card,
      name: 'the_cards'
    })
    cards: Card[] = [new Card()]

    @JsonProperty({
      type: Address,
      name: 'addresses'
    })
    addresses: Address[] = [new Address()]
  }

  it('deserialize should work (with correct data source).', () => {
    const user = deserialize({
      name: 'LancerComet',
      age: 100,
      date: '1926-08-17 00:00:00',
      books: ['bookA', 'bookB'],
      the_cards: [
        { id: 'card-01', value: 10 }
      ],
      addresses: [
        {
          label: 'the heaven',
          the_address: 'above the sky',
          detail: { postcode: 0, isExist: false }
        },
        {
          label: 'the hell',
          the_address: 'below the ground',
          detail: { postcode: 1, isExist: true }
        }
      ]
    }, User)

    expect(user).toEqual({
      name: 'LancerComet',
      age: 100,
      date: new Date('1926-08-17 00:00:00'),
      books: ['bookA', 'bookB'],
      cards: [
        { id: 'card-01', value: 10 }
      ],
      addresses: [
        {
          label: 'the heaven',
          address: 'above the sky',
          detail: { postcode: 0, isExist: false }
        },
        {
          label: 'the hell',
          address: 'below the ground',
          detail: { postcode: 1, isExist: true }
        }
      ]
    })
  })

  it('deserialize should work (with incorrect data source).', () => {
    const user = deserialize({
      wrong_name_prop: 'LancerComet',  // wrong property name
      age: null,                       // null value
      date: false,                     // wrong date value
      wrong_books: ['bookA', false],   // wrong property name
      cards: [                         // wrong property name
        { id: () => 1, value: false }  // wrong value type
      ],
      addresses: [
        {
          label: {},                                   // wrong value type
          the_address: undefined,                      // undefined value
          detail: { postcode: false, isExist: false }  // wrong value type
        },
        {
          the_label: () => {},                         // wrong property name & value type
          the_address: 'below the ground',
          detail: { postcode: 1, isExist: 'a' }        // partial wrong value type
        }
      ]
    }, User)

    expect(user).toEqual({
      name: '',
      age: null,
      date: DEFAULT_DATE,
      books: [],
      cards: [
        { id: '', value: 0 }
      ],
      addresses: [
        {
          label: '',
          address: '',
          detail: { postcode: false, isExist: false }  // Because this is a interface so this should the incorrect payload value.
        },
        {
          label: '',
          address: 'below the ground',
          detail: { postcode: 1, isExist: 'a' }  // Because this is a interface so this should the incorrect payload value.
        }
      ]
    })
  })
})

describe('Undefined data source testing.', () => {
  @Serializable()
  class Example {
    @JsonProperty()
    name: string = ''

    @JsonProperty()
    age: number

    @JsonProperty()
    heavy: number = null

    @JsonProperty({
      isDisallowNull: true
    })
    heavy2: number = 0
  }

  it('Should get an undefined.', () => {
    expect(deserialize(undefined, Example)).toBe(undefined)
  })

  it('Should get the specific value.', () => {
    expect(deserialize({}, Example)).toEqual({
      name: '',
      heavy: null,
      heavy2: 0
    })
  })
})

describe('Inheritance testing.', () => {
  it('Should deal with inheritance correctly.', () => {
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

describe('isDisallowNull testing.', () => {
  it('isDisallowNull in @Serializable should work correctly.', () => {
    @Serializable({
      isDisallowNull: true
    })
    class NullDisallow {
      @JsonProperty()
      name: string = 'one'
    }

    @Serializable()
    class Nullable {
      @JsonProperty()
      name: string = 'two'
    }

    expect(deserialize(null, NullDisallow)).toEqual(new NullDisallow())
    expect(deserialize(null, Nullable)).toBe(null)
  })

  it('isDisallowNull in @JsonProperty should work correctly.', () => {
    const dataSource = { name: null, age: null, heavy: null }

    @Serializable()
    class Example {
      @JsonProperty()
      name: string = ''

      @JsonProperty({
        isDisallowNull: true
      })
      age: number = 0

      @JsonProperty({
        isDisallowNull: false
      })
      heavy: number = 0
    }

    expect(deserialize(dataSource, Example)).toEqual({
      name: null,
      age: 0,
      heavy: null
    })

    @Serializable({
      isDisallowNull: true
    })
    class Example2 {
      @JsonProperty({
        isDisallowNull: true
      })
      name: string = ''

      @JsonProperty({
        isDisallowNull: true
      })
      age: number = 0

      @JsonProperty({
        isDisallowNull: false
      })
      heavy: number = 0
    }

    expect(deserialize(dataSource, Example2)).toEqual({
      name: '',
      age: 0,
      heavy: null
    })
  })
})
