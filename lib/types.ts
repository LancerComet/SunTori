interface ISerializableOption {
  /**
   * Whether allows null value from data source.
   *
   * If set to true, a default instance would be returned when
   * calling "deserialize()" with a null value from data source.
   *
   * @default false
   */
  isDisallowNull?: boolean
}

interface IJsonPropertyOption {
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
   * Whether allows null value from data source.
   *
   * If set to true, the fallback value would be assigned when
   * receiving a null value from data source.
   *
   * @default false
   */
  isDisallowNull?: boolean
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
  ISerializableOption,
  IJsonPropertyOption,
  IAllPropertiesMetaData,
  ConstructorOf
}
