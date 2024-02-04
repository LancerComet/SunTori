import { META_KEY_NULLABLE, META_KEY_DYNAMIC_KEY, META_KEY_JSON_STRING, META_KEY_PARSE_INT, META_KEY_PARSE_FLOAT } from '../config/meta'
import { createPlainObject } from '../utils/object'

/**
 * MetaRegistry type.
 * This kinda registry is used to indicate which prop is decorated.
 */
type MetaRegistry = { [propName: string]: true }

/**
 * Define a decorator.
 *
 * @param metaKey
 */
function defineDecorator (metaKey: string) {
  return function (targetClass: object, propName: string) {
    const metadataRegistry: MetaRegistry = Reflect.hasMetadata(metaKey, targetClass)
      ? Reflect.getMetadata(metaKey, targetClass)
      : createPlainObject()

    if (!metadataRegistry[propName]) {
      metadataRegistry[propName] = true
    }

    Reflect.defineMetadata(metaKey, metadataRegistry, targetClass)
  }
}

/**
 * Make a property that can receive "json-string" payload.
 *
 * @example
 * @Serializable()
 * class A {
 *   @JsonProperty()
 *   readonly name: string = ''
 *
 *   @JsonProperty()
 *   readonly age: number = 0
 * }
 *
 * @Serializable()
 * class B {
 *   @JsonProperty()
 *   @JsonString()
 *   readonly a: A = new A()
 * }
 *
 * const b = deserialize({
 *   a: '{ "name": "John Smith", "age": 100 }'
 * }, B)
 */
function JsonString () {
  return defineDecorator(META_KEY_JSON_STRING)
}

/**
 * Make a property that can receive dynamic key-value payload.
 *
 * @example
 * @Serializable()
 * class A {
 *   @JsonProperty()
 *   readonly a: string = ''
 * }
 *
 * @Serializable()
 * class B {
 *   @JsonProperty({
 *     name: 'collectionA',
 *     type: A
 *   })
 *   @DynamicKey()
 *   readonly collectionA: { [key: string]: A } = {}
 * }
 *
 * const b = deserialize({
 *   collectionA: {
 *     mine: { a: 'Wow' },
 *     yours: { a: 'Such a' },
 *     theirs: { a: 'A' }
 *   }
 * }, B)
 */
function DynamicKey () {
  return defineDecorator(META_KEY_DYNAMIC_KEY)
}

/**
 * Make a property that receives null.
 * By default, the fallback value would be used when a null is received.
 *
 * @example
 * @Serializable()
 * class A {
 *   @JsonProperty()
 *   readonly a: string = '--'
 *
 *   @JsonProperty()
 *   @Nullable()
 *   readonly b: string = '--'
 * }
 *
 * const a = deserialize({
 *   a: null,
 *   b: null
 * }, A)
 *
 * a.a  // '--'
 * a.b  // null
 */
function Nullable () {
  return defineDecorator(META_KEY_NULLABLE)
}

/**
 * A prop that decorated by this decorator will be parsed as int in force.
 *
 * @example
 * @Serializable()
 * class A {
 *   @JsonProperty()
 *   @ParseInt()
 *   readonly id: number = 0
 * }
 *
 * const a = deserialize({
 *   id: '10'
 * }, A)
 */
function ParseInt () {
  return defineDecorator(META_KEY_PARSE_INT)
}

/**
 * A prop that decorated by this decorator will be parsed as float in force.
 *
 * @example
 * @Serializable()
 * class A {
 *   @JsonProperty()
 *   @ParseFloat()
 *   readonly value: number = 0
 * }
 *
 * const a = deserialize({
 *   value: '10.24'
 * }, A)
 */
function ParseFloat () {
  return defineDecorator(META_KEY_PARSE_FLOAT)
}

/**
 * Check a meta registry has target prop assigned.
 *
 * @param metaKey
 * @param propName
 * @param instance
 */
function checkMetaRegistryHasProp (metaKey: string, propName: string, instance: any): boolean {
  const metaRegistry = Reflect.getMetadata(metaKey, instance)
  return metaRegistry?.[propName] === true
}

export {
  JsonString,
  DynamicKey,
  Nullable,
  ParseInt,
  ParseFloat,
  checkMetaRegistryHasProp
}
