import { ConstructorOf, IAllPropertiesMetaData, IJsonPropertyOption } from '../types'
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
    // @JsonProperty()
    case 'undefined':
      result.name = propName
      break

    // @JsonProperty('prop_name')
    case 'string':
      result.name = param
      break

    // @JsonProperty({ name: 'prop_name', type: SomeType })
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

  if (!checkIsSerializable(targetType)) {
    return instance
  }

  const propsDataMetaKey = createPropDataMetaKey()

  // 取 MetaData 时需要从原型对象上取.
  // JS 的 MetaData 具有继承行为，会挨个去 __proto__ 上取 MetaData, 所以一定会取到基类的元数据.
  // 所以这里的数据是包含基类的.
  const propsMetaData: IAllPropertiesMetaData = Reflect.getMetadata(propsDataMetaKey, targetType.prototype)
  Object.keys(propsMetaData).forEach(propName => {
    const propMetaData = propsMetaData[propName]
    const jsonValue = dataSource[propMetaData.name]
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
  instance: any, propName: string, propMetaData: IJsonPropertyOption, jsonValue: any
) {
  const targetTypeObject: any = propMetaData.type || Reflect.getMetadata('design:type', instance, propName)
  const typeName = targetTypeObject.name.toLowerCase()

  // Deal with inserializable type directly.
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

  if (Array.isArray(jsonValue)) {
    const result = []
    jsonValue.forEach(item => {
      result.push(deserialize(item, targetTypeObject))
    })
    return result
  }

  return deserialize(jsonValue, targetTypeObject)
}

export {
  JsonProperty,
  Serializable,
  deserialize
}
