import { META_KEY_DISALLOW_NULL, META_KEY_DYNAMIC_KEY, META_KEY_JSON_STRING } from '../config/meta'
import { createPlainObject } from '../utils/object'

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
  return defineDecorator(META_KEY_DISALLOW_NULL)
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
  // tslint:disable-next-line:whitespace
  return metaRegistry?.[propName] === true
}

export {
  JsonString,
  DynamicKey,
  Nullable,
  checkMetaRegistryHasProp
}

/**
 * MetaRegistry type.
 * This kinda registry is used to indicate which prop is decorated.
 */
// tslint:disable-next-line:interface-over-type-literal
type MetaRegistry = { [propName: string]: true }
