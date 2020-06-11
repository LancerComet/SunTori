# @vert/serializer

[![Build Status](https://travis-ci.org/vuevert/Vert-Serializer.svg?branch=master)](https://travis-ci.org/vuevert/Vert-Serializer)

JSON serialization and deserialization.

## Quick Start.

```
npm install reflect-metadata --save
```

`Reflect-Metadata` should be included first:

```typescript
// Project entry.
import 'reflect-metadata'
```

### Deserialization.

```typescript
import { Serializable, JsonProperty, deserialize } from '@vert/serializer'

@Serializable()
class User {
  @JsonProperty()
  name: string = ''

  @JsonProperty()
  age: number = 0

  // Property name matching.
  // "user_address" (json) -> "address" (model)
  @JsonProperty('user_address')
  address: string = 'Default address'
}

const dataSource = {
  name: 'Doge',
  age: 1,
  user_address: 'The Moon.'
}
const doge = deserialize(dataSource, User)  // User
```

### Array-typed deserialization.

```typescript
import { Serializable, JsonProperty, deserialize } from '@vert/serializer'

@Serializable()
class User {
  @JsonProperty()
  name: string = ''

  @JsonProperty()
  age: number = 0

  @JsonProperty('user_address')
  address: string = 'Default address'
}


@Serializable()
class UserList {
  // Array-typed property must be described like this.
  @JsonProperty({
    name: 'users',
    type: User
  })
  users: User[] = []
}

const dataSource = [
  { name: 'LancerComet', age: 10, user_address: 'The Mars.' },
  { name: 'John Smith', age: 100, user_address: 'The Heaven.' }
]
const userList = deserialize(dataSource, UserList)  // User[]
```

### Serialization.

```typescript
@Serializable()
class User {
  @JsonProperty()
  name: string = ''

  @JsonProperty()
  age: number = 0

  @JsonProperty('user_address')
  address: string = 'Default address'
}

const dataSource = {
  name: 'Doge',
  age: 1,
  user_address: 'The Moon.'
}
const doge = deserialize(dataSource, User)  // User

const json = serialize(doge)  // json should be "equal" to dataSource.

```

## API

```typescript
namespace Serializer {
  /**
   * Define a json property.
   *
   * @export
   * @param {(string | IJsonPropertyOption)} [param] JSON property config.
   */
  export function JsonProperty (param?: string | {
    /**
     * Property in data source.
     */
    name?: string

    /**
     * Target model class.
     * This param must be provided for array-typed property.
     */
    type?: any

    /**
     * Whether convert a null value into a fallback value.
     * The default value is false, when it is set to true,
     * a fallback value would be assigned when a null value is received from data source.
     */
    isDeserializeNull?: boolean
  })

  /**
   * Make a class serializable.
   *
   * @export
   */
  export function Serializable (options?: {
    /**
     * Whether convert a null value into a default instance.
     * The default value is false, when it is set to true,
     * a default instance would be assigned when a null value is received from data source.
     */
    isDeserializeNull?: boolean
  })

  /**
   * Deserialize json to model class.
   *
   * @template T
   * @param {object} dataSource Data source, a json object.
   * @param {ConstructorOf<T>} targetType Target model class.
   * @returns {T}
   */
  export function deserialize<T> (dataSource: object, targetType: new (...agrs: any[]) => T): T

  /**
   * Decorated property will be ignored while serializing.
   *
   * @export
   */
  export function JsonIgnore ()

  /**
   * Serialize model class to json.
   *
   * @export
   * @template T
   * @param {*} target
   * @returns {T}
   */
  export function serialize<T = any> (target: any): T
}

export = Serializer
```

## License 

MIT
