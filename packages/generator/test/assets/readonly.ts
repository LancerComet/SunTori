@Serializable()
class UserAddresses {
  @JsonProperty('name')
  readonly name: string = ''

  @JsonProperty('location')
  readonly location: string = ''
}

@Serializable()
class UserMeta {
  @JsonProperty('leaveTimes')
  readonly leaveTimes: number = 0

  @JsonProperty('dates')
  readonly dates: unknown[] = []
}

@Serializable()
class User {
  @JsonProperty('name')
  readonly name: string = ''

  @JsonProperty('age')
  readonly age: number = 0

  @JsonProperty('is_dead')
  readonly isDead: boolean = false

  @JsonProperty({ name: 'addresses', type: UserAddresses })
  readonly addresses: UserAddresses[] = []

  @JsonProperty('title')
  readonly title: unknown = null

  @JsonProperty('meta')
  readonly meta: UserMeta = new UserMeta()

  @JsonProperty('ranks')
  readonly ranks: number[] = []
}
