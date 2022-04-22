/**
 * Option of @JsonProperty.
 *
 * @class JsonPropertyMetaData
 */
interface IJsonPropertyOption {
  /**
   * Property name in data source.
   */
  name?: string

  /**
   * Target model.
   * This param must be provided for array-typed property.
   */
  type?: any
}

/**
 * All properties' meta data in a single class.
 *
 * @interface IAllPropertiesMetaData
 */
interface IAllPropertiesMetaData {
  [propName: string]: IJsonPropertyOption
}

/**
 * Get the constructor type of something.
 */
type ConstructorOf<T> = new (...agrs: any[]) => T

export {
  IJsonPropertyOption,
  IAllPropertiesMetaData,
  ConstructorOf
}
