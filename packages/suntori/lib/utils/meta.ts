import { META_KEY_SERIALIZABLE } from '../config/meta'

/**
 * Check whether a class is decorated by @Serializable.
 *
 * @param {*} target
 * @returns {boolean}
 */
function checkIsSerializable (target: any): boolean {
  return Reflect.hasOwnMetadata(META_KEY_SERIALIZABLE, target)
}

export {
  checkIsSerializable
}
