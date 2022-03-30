# SunTori

[![SunTori](https://github.com/LancerComet/SunTori/workflows/Test/badge.svg)](https://github.com/LancerComet/SunTori/actions)

SunTori is a JSON serializer for TypeScript.

![SunTori](https://raw.githubusercontent.com/LancerComet/SunTori/master/suntori.png)

## Features

 - JSON <--- Mapping ---> Class.
 - JSON fields name <--- Mapping ---> Class props name.
 - Runtime typesafe.
 - Deal with raw strings and dynamic keys.

## First of all

SunTori depends on the very feature `emitDecoratorMetadata` which was introduced to TypeScript, so keep in mind:

 - Not available in pure JavaScript enviroment. You have to use it with TypeScript.
 - Not available for ESBuild because ESBuild doesn't emit decorator metadata.

## Installation

Install `reflect-metadata:`

```
npm install reflect-metadata --save
```

Import `reflect-metadata` in the whole project entry:

```typescript
// Project entry.
import 'reflect-metadata'
```

Remember to enable this two things in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true
```

## Usage

### Deserialization.

```typescript
import { Serializable, JsonProperty, deserialize } from '@lancercomet/suntori'

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
```

### Array-typed deserialization.

```typescript
import { Serializable, JsonProperty, deserialize } from '@lancercomet/suntori'

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

## More decorators

### @JsonString

```ts
import { Serializable, JsonProperty, deserialize, JsonString } from '@lancercomet/suntori'

@Serializable()
class A {
  @JsonProperty()
  a: string = ''
}

@Serializable()
class B {
  @JsonProperty({
    type: A,
    name: 'list1'
  })
  list1: A[] = []

  @JsonProperty({
    type: A,
    name: 'list2'
  })
  @JsonString()  // <-- Add this.
  list2: A[] = []
}

const b = deserialize({
  list1: '[{ "a": "a1" }, { "a": "a2" }]',  // Oh no.
  list2: '[{ "a": "a1" }, { "a": "a2" }]'   // Yeah!
}, B)
```

### @DynamicKey

```ts
import { Serializable, JsonProperty, deserialize, DynamicKey } from '@lancercomet/suntori'

@Serializable()
class A {
  @JsonProperty()
  a: string = ''
}

@Serializable()
class B {
  @JsonProperty({
    name: 'as',
    type: A
  })
  @DynamicKey()  // <-- Add this.
  as: { [key: string]: A } = {}    
}

const b = deserialize({
  as: {
    a: {},
    b: {},
    c: {}
  }
}, B)
```

### @Nullable

```ts
@Serializable()
class A {
  @JsonProperty()
  readonly num: number = 0

  @JsonProperty()
  @Nullable()  // <--- Add this.
  readonly numNullable: number = 0

  @JsonProperty()
  @Nullable()  // <--- Add this.
  readonly numNullable2: number = 0
}

const a = deserialize({
  num: null,
  numNullable: null,
  numNullable2: undefined
}, A)

console.log(a.num)           // 0
console.log(a.numNullable)   // null
console.log(a.numNullable2)  // 0, only got null if payload were null.
```

## License 

MIT
