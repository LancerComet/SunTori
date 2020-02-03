/**
 * 创建 "用于存储被 @JsonProperty 装饰的属性的元数据" 的键名.
 */
function createPropDataMetaKey (): string {
  return 'serializer:props'
}

/**
 * 创建 "@Serializable" 键名.
 */
function createSerializableMetaKey () {
  return 'serializer:serializable'
}

/**
 * 检测目标值是否被 @Serializable 装饰.
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
