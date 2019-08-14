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
  })

  /**
   * Make a class serializable.
   *
   * @export
   */
  export function Serializable ()

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
