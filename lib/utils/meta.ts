/**
 * Reflect key for @JsonProperty.
 */
function createPropDataMetaKey (): string {
  return 'serializer:props'
}

/**
 * Reflect key for @Serializable.
 */
function createSerializableMetaKey () {
  return 'serializer:serializable'
}

/**
 * Check whether target is serializable.
 *
 * @param {*} target
 * @returns {boolean}
 */
function checkIsSerializable (target: any): boolean {
  return Reflect.hasOwnMetadata(createSerializableMetaKey(), target)
}

export {
  createPropDataMetaKey,
  createSerializableMetaKey,
  checkIsSerializable
}
