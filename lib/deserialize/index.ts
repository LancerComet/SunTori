import { ConstructorOf, IAllPropertiesMetaData, IJsonPropertyOption, ISerializableOption } from '../types'
import { isArray } from '../utils/array'
import { checkIsSerializable, createPropDataMetaKey, createSerializableMetaKey, createSerializableOptionMetaKey } from '../utils/meta'

/**
 * Decorate a class serializable.
 */
function Serializable (options: ISerializableOption = {}) {
  return function (target: object) {
    Reflect.defineMetadata(createSerializableMetaKey(), true, target)
    Reflect.defineMetadata(createSerializableOptionMetaKey(), options, target)
  }
}

/**
 * Define json property.
 *
 * @param {string | IJsonPropertyOption} [param]
 */
function JsonProperty (param?: string | IJsonPropertyOption) {
  return function (targetClass: object, propName: string) {
    let propsMetaData: IAllPropertiesMetaData = {}

    const propsDataMetaKey = createPropDataMetaKey()
    if (Reflect.hasMetadata(propsDataMetaKey, targetClass)) {
      propsMetaData = Reflect.getMetadata(propsDataMetaKey, targetClass)
    }

    propsMetaData[propName] = createJsonPropertyMetaData(propName, param)
    Reflect.defineMetadata(propsDataMetaKey, propsMetaData, targetClass)
  }
}

/**
 * Create metadata for prop.
 *
 * @param {string} propName
 * @param {string | IJsonPropertyOption} [param]
 * @returns {IJsonPropertyOption}
 */
function createJsonPropertyMetaData (propName: string, param?: string | IJsonPropertyOption): IJsonPropertyOption {
  const result: IJsonPropertyOption = Object.create(null)

  switch (typeof param) {
    case 'undefined':
      result.name = propName
      break

    case 'string':
      result.name = param
      break

    default:
      result.name = param.name || propName
      result.type = param.type
      result.isDeserializeNull = param.isDeserializeNull
      break
  }

  return result
}

/**
 * JSON -> Model.
 *
 * @template T
 * @param {any} dataSource
 * @param {ConstructorOf<T>} targetType
 * @returns {T}
 */
function deserialize<T> (dataSource: any, targetType: ConstructorOf<T>): T {
  const instance = new targetType()

  if (!checkIsSerializable(targetType)) {
    return instance
  }

  const { isDeserializeNull } = Reflect.getOwnMetadata(
    createSerializableOptionMetaKey(),
    targetType
  ) as ISerializableOption

  if (dataSource === null || typeof dataSource === 'undefined') {
    return isDeserializeNull
      ? instance
      : null
  }

  const allPropertiesMetaData = Reflect.getMetadata(
    createPropDataMetaKey(), targetType.prototype
  ) as IAllPropertiesMetaData

  Object.keys(allPropertiesMetaData).forEach(propName => {
    const propMetaData = allPropertiesMetaData[propName]
    const jsonPropName = propMetaData.name
    const jsonValue = dataSource[jsonPropName]
    if (typeof jsonValue !== 'undefined') {
      instance[propName] = createModelValueFromJson(instance, propName, propMetaData, jsonValue)
    }
  })

  return instance
}

/**
 * Create model value.
 *
 * @param {*} instance
 * @param {string} propName
 * @param {IJsonPropertyOption} propMetaData
 * @param {*} jsonValue
 * @returns
 */
function createModelValueFromJson (
  instance: any,
  propName: string,
  propMetaData: IJsonPropertyOption,
  jsonValue: any
) {
  const targetTypeObject: any =
    propMetaData.type ||
    Reflect.getMetadata('design:type', instance, propName)

  const typeName = targetTypeObject.name.toLowerCase()
  const defaultValue = instance[propName]
  const isDeserializeNull = propMetaData.isDeserializeNull

  // 基础类型和没有被 @Serializable 的 object.
  if (!checkIsSerializable(targetTypeObject)) {
    switch (typeName) {
      case 'number':
        return isNaN(jsonValue) ? undefined : jsonValue

      case 'string':
        return typeof jsonValue === 'string' ? jsonValue : undefined

      case 'boolean':
        return typeof jsonValue === 'boolean' ? jsonValue : undefined

      case 'date':
        return isNaN(Date.parse(jsonValue)) ? undefined : new Date(jsonValue)

      default:
        return jsonValue
    }
  }

  // 被 Serializable 装饰的引用类型.
  const isArrayTyped = isArray(defaultValue) || isArray(jsonValue)

  // 如果是数组则循环遍历.
  if (isArrayTyped) {
    // 如果传来的是 null 值, 就返回默认值.
    if (jsonValue === null) {
      return defaultValue
    }

    if (isArray(jsonValue)) {
      const result = []
      jsonValue.forEach(item => {
        if (item === null && isDeserializeNull) {
          result.push(defaultValue)
        } else {
          result.push(deserialize(item, targetTypeObject))
        }
      })
      return result
    }
  }
  // 非数组类型.
  if (isDeserializeNull && jsonValue === null) {
    return defaultValue
  }

  return deserialize(jsonValue, targetTypeObject)
}

export {
  JsonProperty,
  Serializable,
  deserialize
}
