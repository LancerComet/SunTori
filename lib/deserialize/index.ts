import {
  META_KEY_DISALLOW_NULL,
  META_KEY_DYNAMIC_KEY,
  META_KEY_JSON_PROPERTY,
  META_KEY_JSON_STRING,
  META_KEY_SERIALIZABLE
} from '../config/meta'
import { ConstructorOf, IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
import { checkIsSerializable } from '../utils/meta'
import { createPlainObject } from '../utils/object'
import { isArray, isBoolean, isFunction, isNull, isNumber, isString, isUndefined } from '../utils/type'
import { checkMetaRegistryHasProp } from './decorator'

/**
 * Make a class serializable.
 */
function Serializable () {
  return function (target: object) {
    Reflect.defineMetadata(META_KEY_SERIALIZABLE, true, target)
  }
}

/**
 * Define a json property.
 *
 * @param {(string | IJsonPropertyOption)} [param] JSON property config.
 */
function JsonProperty (param?: string | IJsonPropertyOption) {
  return function (targetClass: object, propName: string) {
    const metadataRegistry: IAllPropertiesMetaData =
      Reflect.hasMetadata(META_KEY_JSON_PROPERTY, targetClass)
        ? Reflect.getMetadata(META_KEY_JSON_PROPERTY, targetClass)
        : {}

    metadataRegistry[propName] = createJsonPropertyMetaData(propName, param)
    Reflect.defineMetadata(META_KEY_JSON_PROPERTY, metadataRegistry, targetClass)
  }
}

/**
 * Deserialize the json to the model.
 *
 * @template T
 * @param {object} dataSource
 * @param {ConstructorOf<T>} targetType
 * @returns {T}
 */
function deserialize<T> (dataSource: any, targetType: ConstructorOf<T>): T {
  const instance = new targetType()

  if (isNull(dataSource) || isUndefined(dataSource)) {
    return null
  }

  if (!checkIsSerializable(targetType)) {
    return instance
  }

  const propsMetaData: IAllPropertiesMetaData = Reflect.getMetadata(META_KEY_JSON_PROPERTY, targetType.prototype)
  Object.keys(propsMetaData).forEach(propName => {
    const propMetaData = propsMetaData[propName]
    const jsonPropName = propMetaData.name
    const payload = dataSource[jsonPropName]
    if (!isUndefined(payload)) {
      instance[propName] = createModelValueFromJson(instance, propName, propMetaData, payload)
    }
  })

  return instance
}

export {
  JsonProperty,
  Serializable,
  deserialize
}

/**
 * Create metadata for prop.
 *
 * @param {string} propName
 * @param {string | IJsonPropertyOption} [param]
 * @returns {IJsonPropertyOption}
 */
function createJsonPropertyMetaData (propName: string, param?: string | IJsonPropertyOption): IJsonPropertyOption {
  const result: IJsonPropertyOption = createPlainObject()

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
 * Create model value.
 *
 * @param {*} instance
 * @param {string} propName
 * @param {IJsonPropertyOption} propMetaData
 * @param {*} payload
 * @returns
 */
function createModelValueFromJson (
  instance: any,
  propName: string,
  propMetaData: IJsonPropertyOption,
  payload: any
) {
  const expectedType: any = propMetaData.type || Reflect.getMetadata('design:type', instance, propName)
  const fallbackValue = instance[propName]

  const isNullable = checkMetaRegistryHasProp(META_KEY_DISALLOW_NULL, propName, instance)
  if (payload === null) {
    return isNullable ? null : fallbackValue
  }

  if (expectedType === Number) {
    return isNumber(payload) ? payload : fallbackValue
  }

  if (expectedType === String) {
    return isString(payload) ? payload : fallbackValue
  }

  if (expectedType === Boolean) {
    return isBoolean(payload) ? payload : fallbackValue
  }

  if (expectedType === Date) {
    return isNaN(Date.parse(payload)) ? fallbackValue : new Date(payload)
  }

  const isSerializable = checkIsSerializable(expectedType)
  if (!isSerializable) {
    return payload
  }

  const isPropJsonString = checkMetaRegistryHasProp(META_KEY_JSON_STRING, propName, instance)
  if (isPropJsonString && isString(payload)) {
    try {
      payload = JSON.parse(payload)
    } catch (error) {
      console.error(`[Serializer] Failed to parse JsonString prop "${propName}", default value returned.`)
      return fallbackValue
    }
  }

  const isSourceArrayTyped = isArray(instance[propName])
  const isPayloadArray = isArray(payload)
  if (isSourceArrayTyped) {
    if (payload === null) {
      return fallbackValue
    }

    const isFallbackArray = isArray(fallbackValue)
    if (!isFallbackArray) {
      return null
    }

    if (!isPayloadArray) {
      return fallbackValue
    }

    return (payload as any[]).map(item => deserialize(item, expectedType))
  }

  const isPayloadFunction = isFunction(payload)
  if (isPayloadArray || isPayloadFunction) {
    return fallbackValue
  }

  const isPropDynamicKey = checkMetaRegistryHasProp(META_KEY_DYNAMIC_KEY, propName, instance)
  if (isPropDynamicKey) {
    const result = {}
    Object.keys(payload).forEach(key => {
      result[key] = deserialize(payload[key], expectedType)
    })
    return result
  }

  return deserialize(payload, expectedType)
}
