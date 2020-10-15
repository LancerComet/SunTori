import { ConstructorOf, IAllPropertiesMetaData, IJsonPropertyOption, ISerializableOption } from '../types'
import { isArray, isBoolean, isDate, isNull, isNumber, isString, isUndefined } from '../utils/type'
import { checkIsSerializable, createPropDataMetaKey, createSerializableMetaKey, createSerializableOptionMetaKey } from '../utils/meta'

/**
 * Make a class serializable.
 */
function Serializable (options: ISerializableOption = {}) {
  return function (target: object) {
    Reflect.defineMetadata(createSerializableMetaKey(), true, target)
    Reflect.defineMetadata(createSerializableOptionMetaKey(), options, target)
  }
}

/**
 * Define a json property.
 *
 * @param {(string | IJsonPropertyOption)} [param] JSON property config.
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
      result.isDisallowNull = param.isDisallowNull
      break
  }

  return result
}

/**
 * Deserialize json to model class.
 * JSON -> Model.
 *
 * @template T
 * @param {object} dataSource Data source, a json object.
 * @param {ConstructorOf<T>} targetType Target model class.
 * @returns {T}
 */
function deserialize<T> (dataSource: any, targetType: ConstructorOf<T>): T {
  const instance = new targetType()

  if (!checkIsSerializable(targetType)) {
    return instance
  }

  const { isDisallowNull } = Reflect.getOwnMetadata(
    createSerializableOptionMetaKey(),
    targetType
  ) as ISerializableOption

  if (isUndefined(dataSource)) {
    return
  }

  if (isNull(dataSource)) {
    return isDisallowNull ? instance : null
  }

  const allPropertiesMetaData = Reflect.getMetadata(
    createPropDataMetaKey(), targetType.prototype
  ) as IAllPropertiesMetaData

  Object.keys(allPropertiesMetaData).forEach(propName => {
    const propMetaData = allPropertiesMetaData[propName]
    const jsonPropName = propMetaData.name
    const jsonValue = dataSource[jsonPropName]
    if (!isUndefined(jsonValue)) {
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
  const isDisallowNull = propMetaData.isDisallowNull

  // 基础类型和没有被 @Serializable 的 object.
  if (!checkIsSerializable(targetTypeObject)) {
    switch (typeName) {
      case 'number': {
        if (jsonValue === null && !isDisallowNull) {
          return null
        }

        if (isNumber(jsonValue)) {
          return jsonValue
        }

        if (isNumber(defaultValue)) {
          return defaultValue
        }

        return undefined
      }

      case 'string': {
        if (jsonValue === null && !isDisallowNull) {
          return null
        }

        if (isString(jsonValue)) {
          return jsonValue
        }

        if (isString(defaultValue)) {
          return defaultValue
        }

        return undefined
      }

      case 'boolean': {
        if (jsonValue === null && !isDisallowNull) {
          return null
        }

        if (isBoolean(jsonValue)) {
          return jsonValue
        }

        if (isBoolean(defaultValue)) {
          return defaultValue
        }

        return undefined
      }

      case 'date': {
        if (jsonValue === null && !isDisallowNull) {
          return null
        }

        const isDateInvalid = isNaN(Date.parse(jsonValue))
        return isDateInvalid
          ? isDate(defaultValue) ? defaultValue : undefined
          : new Date(jsonValue)
      }

      default: {
        return jsonValue
      }
    }
  }

  // 被 Serializable 装饰的引用类型.

  // 如果是数组则循环遍历.
  const isArrayTyped = isArray(defaultValue) || isArray(jsonValue)
  if (isArrayTyped) {
    // 如果传来的是 null 值, 就返回默认值.
    if (jsonValue === null) {
      return defaultValue
    }

    if (isArray(jsonValue)) {
      const result = []
      jsonValue.forEach(item => {
        if (item === null && isDisallowNull) {
          result.push(defaultValue)
        } else {
          result.push(deserialize(item, targetTypeObject))
        }
      })
      return result
    }
  }

  // 非数组类型.
  if (isDisallowNull && jsonValue === null) {
    return defaultValue
  }

  return deserialize(jsonValue, targetTypeObject)
}

export {
  JsonProperty,
  Serializable,
  deserialize
}
