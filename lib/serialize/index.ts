import { IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
import { checkIsSerializable, createPropDataMetaKey } from '../utils/meta'

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
      '[lib.serializer] 此对象不可被序列化, 请确定已使用 @Serializable 进行装饰:', target.constructor
    )
    return Object.create(null)
  }

  const clone = composeTargetObject(target)
  return clone as T
}

/**
 * 构建待反序列化的对象
 *
 * @param {*} sourceObject
 */
function composeTargetObject (sourceObject: any): { [key: string]: any } | string | number | boolean {
  if (typeof sourceObject === 'string' || typeof sourceObject === 'number' || typeof sourceObject === 'boolean') {
    return sourceObject
  }

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
 * Decorated property will be ignored when serializing.
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

/**
 * 获取属性的目标键名
 *
 * @param propsMeta
 * @param propName
 */
function getTargetKey (propsMeta: IAllPropertiesMetaData, propName: string): string {
  const propMeta: IJsonPropertyOption = propsMeta[propName] || {}
  return propMeta.name || propName
}
