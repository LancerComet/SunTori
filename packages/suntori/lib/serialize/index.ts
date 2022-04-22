import { META_KEY_JSON_PROPERTY } from '../config/meta'
import { IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
import { checkIsSerializable } from '../utils/meta'
import { createPlainObject } from '../utils/object'
import { isBoolean, isNull, isNumber, isString, isUndefined } from '../utils/type'

/**
 * Serialize model class to json.
 * Model -> JSON.
 *
 * @template T
 * @param {*} target
 * @returns {T}
 */
function serialize <T = any> (target: any): T {
  const isSerializable = checkIsSerializable(target.constructor)
  if (!isSerializable) {
    console && console.warn && console.warn(
      '[Serializer] This class can not be serialized, please make sure @Serializable is placed:', target.constructor
    )
    return createPlainObject()
  }

  const clone = composeTargetObject(target)
  return clone as T
}

/**
 * Build the serialized data.
 *
 * @param {*} sourceObject
 */
function composeTargetObject (sourceObject: any): { [key: string]: any } | number | boolean | string {
  // Basic types just return itself.
  if (isString(sourceObject) || isNumber(sourceObject) || isBoolean(sourceObject)) {
    return sourceObject
  }

  if (isUndefined(sourceObject)) {
    return undefined
  }

  if (isNull(sourceObject)) {
    return null
  }

  const clone = createPlainObject()
  const propsMeta: IAllPropertiesMetaData = Reflect.getMetadata(META_KEY_JSON_PROPERTY, sourceObject) || {}

  Object.keys(sourceObject)
    .filter(key => !checkIsIgnoreProp(sourceObject, key))
    .forEach(key => {
      const value = sourceObject[key]
      const targetKey = getTargetKey(propsMeta, key)

      switch (typeof value) {
        case 'function':
          clone[targetKey] = null
          break

        case 'object':
          if (Array.isArray(value)) {
            clone[targetKey] = value.map(item => composeTargetObject(item))
          } else {
            clone[targetKey] = composeTargetObject(value)
          }
          break

        default:
          clone[targetKey] = value
          break
      }
    })

  return clone
}

/**
 * Decorate a property that is going to be ignored while serializing.
 */
function JsonIgnore () {
  return function (targetClass: object, propName: string) {
    Reflect.defineMetadata(`serializer:json-ignore:${propName}`, true, targetClass)
  }
}

export {
  serialize,
  JsonIgnore
}

function checkIsIgnoreProp (targetClass: object, propName: string): boolean {
  return Reflect.hasMetadata(`serializer:json-ignore:${propName}`, targetClass)
}

function getTargetKey (propsMeta: IAllPropertiesMetaData, propName: string): string {
  const propMeta: IJsonPropertyOption = propsMeta[propName] || {}
  return propMeta.name || propName
}
