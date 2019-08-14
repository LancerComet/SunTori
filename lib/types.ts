/**
 * 被 @JsonProperty 装饰的属性的元数据对象.
 *
 * @class JsonPropertyMetaData
 */
interface IJsonPropertyOption {
  /**
   * 反序列化时数据源的属性名称.
   */
  name?: string

  /**
   * 反序列化的目标类型.
   * 如果目标是数组类型, 请显式提供此选项.
   */
  type?: any
}

/**
 * Class 中全体属性的元数据信息.
 *
 * @interface IAllPropertiesMetaData
 */
interface IAllPropertiesMetaData {
  [propName: string]: IJsonPropertyOption
}

/**
 * 获取目标类型的构造函数.
 */
type ConstructorOf<T> = new (...agrs: any[]) => T

export {
  IJsonPropertyOption,
  IAllPropertiesMetaData,
  ConstructorOf
}
