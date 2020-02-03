import { ConstructorOf, IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
import { isArray } from '../utils/array'
import { checkIsSerializable, createPropDataMetaKey, createSerializableMetaKey } from '../utils/meta'

/**
 * Decorate a class serializable.
 */
function Serializable () {
  return function (target: object) {
    const serializableMetaKey = createSerializableMetaKey()
    Reflect.defineMetadata(serializableMetaKey, true, target)
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

  if (dataSource === null || typeof dataSource === 'undefined') {
    return null
  }

  if (!checkIsSerializable(targetType)) {
    return instance
  }

  const propsDataMetaKey = createPropDataMetaKey()

  const propsMetaData: IAllPropertiesMetaData = Reflect.getMetadata(propsDataMetaKey, targetType.prototype)
  Object.keys(propsMetaData).forEach(propName => {
    const propMetaData = propsMetaData[propName]
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

  const isArrayTypeData = isArray(instance[propName]) || isArray(jsonValue)
  if (isArrayTypeData) {
    if (jsonValue === null) {
      return instance[propName]
    }

    if (isArray(jsonValue)) {
      const result = []
      jsonValue.forEach(item => {
        result.push(deserialize(item, targetTypeObject))
      })
      return result
    }
  }

  return deserialize(jsonValue, targetTypeObject)
}

export {
  JsonProperty,
  Serializable,
  deserialize
}
