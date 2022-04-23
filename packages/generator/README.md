# SunTori codegen

[![SunTori](https://github.com/LancerComet/SunTori/workflows/Test/badge.svg)](https://github.com/LancerComet/SunTori/actions)
[![npm version](https://badge.fury.io/js/@lancercomet%2Fsuntori.generator.svg)](https://badge.fury.io/js/@lancercomet%2Fsuntori.generator)

A codegen to create [SunTori](https://github.com/LancerComet/SunTori/tree/master/packages/suntori) codes from JSON.

```ts
import { generate } from '@lancercomet/suntori.generator'

const result = await generate({
  jsonObject: {
    name: 'John Smith',
    age: 200,
    address: [
      {
        name: 'Home',
        locaiton: 'The earth'
      }
    ]
  },
  rootClassName: 'User'
})
```

Result:

```ts
@Serializable()
class UserAddress {
  @JsonProperty('name')
  name: string = ''

  @JsonProperty('location')
  location: string = ''
}

@Serializable()
class User {
  @JsonProperty('name')
  name: string = ''

  @JsonProperty('age')
  age: number = 0

  @JsonProperty({
    name: 'address',
    type: UserAddress
  })
  address: UserAddress[] = []
}
```

## Options

 - `jsonObject: never` The JSON payload. Should be a JavaScript Object.
 - `rootClassName: string = 'Root'` The name for generated class. And it will be used as prefix for all subclasses.
 - `useCamelCase: boolean = true` Use `camelCase` during code generation.
 - `addReadonly: boolean = true` Add `readonly` modifier to all members of a class.

## About null

All `null` JSON fields would be converted to the `unknown`, as well as empty arrays.

```ts
await generate({
  jsonObject: {
    a: null,
    b: []
  }
})

// To

@Serializable()
class Root {
  @JsonProperty('a')
  a: unknown = null

  @JsonProperty('b')
  b: unknown[] = []
}
```

## License

Apache-2.0
