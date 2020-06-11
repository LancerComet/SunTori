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
   * Decorated property will be ignored when serializing.
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
