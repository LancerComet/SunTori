import { deserialize } from '../deserialize'
import { serialize } from '../serialize'

/**
 * Clone a model.
 *
 * @template T
 * @param {T} model Target.
 * @returns {T} Cloned one.
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
