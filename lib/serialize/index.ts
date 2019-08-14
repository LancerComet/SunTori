import { IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
import { checkIsSerializable, createPropDataMetaKey } from '../utils/meta'

/**
 * Model -> JSON Object.
 *
 * @returns {string}
 */
function serialize<T = any> (target: any): T {
  const isSerializable = checkIsSerializable(target.constructor)
  if (!isSerializable) {
    console && console.warn && console.warn('[@vert/serializer] This object is not serializable:', target.constructor)
    return Object.create(null)
  }

  const clone = composeTargetObject(target)
  return clone as T
}

/**
 * Create json object.
 *
 * @param {*} sourceObject
 */
function composeTargetObject (sourceObject: any): { [key: string]: any } {
  const clone: any = Object.create(null)
  const propsMeta: IAllPropertiesMetaData = Reflect.getMetadata(createPropDataMetaKey(), sourceObject) || {}

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
 * Decorate some property as "ignored".
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
