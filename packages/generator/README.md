# SunTori codegen

A codegen to create [SunTori](https://github.com/LancerComet/SunTori/tree/master/packages/suntori) codes from JSON.

```ts
import { generate } from '@lancercomet/suntori.generator'

const result = generate({
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

## License

Apache-2.0
