@Serializable()
class UserAddresses {
    @JsonProperty("name")
    name: string = "";
    @JsonProperty("location")
    location: string = "";
}
@Serializable()
class UserMeta {
    @JsonProperty("leaveTimes")
    leaveTimes: number = 0;
    @JsonProperty("dates")
    dates: unknown[] = [];
}
@Serializable()
class User {
    @JsonProperty("name")
    name: string = "";
    @JsonProperty("age")
    age: number = 0;
    @JsonProperty("is_dead")
    isDead: boolean = false;
    @JsonProperty({ name: "addresses", type: UserAddresses })
    addresses: UserAddresses[] = [];
    @JsonProperty("title")
    title: unknown = null;
    @JsonProperty("meta")
    meta: UserMeta = new UserMeta();
    @JsonProperty("ranks")
    ranks: number[] = [];
}
