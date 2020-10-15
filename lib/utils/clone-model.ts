import { deserialize } from '../deserialize'
import { serialize } from '../serialize'

/**
 * Clone a model from an existing one.
 *
 * @template T
 * @param {T} model
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
