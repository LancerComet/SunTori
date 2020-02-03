import { deserialize } from '../deserialize'
import { serialize } from '../serialize'

/**
 * 复制 Model.
 * 将创建一个新的 Model, 并将目标 Model 的值赋予给它.
 *
 * @template T
 * @param {T} model 待复制 Model.
 * @returns {T}
 */
function cloneModel<T> (model: T): T {
  if (model === null || typeof model !== 'object') {
    return null
  }

  const constructor = model.constructor as any
  if (!constructor) {
    return null
  }

  return deserialize(serialize(model), constructor)
}

export {
  cloneModel
}
