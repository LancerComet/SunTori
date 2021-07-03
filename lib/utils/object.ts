function createPlainObject <T = object> (): T {
  return Object.create(null)
}

export {
  createPlainObject
}
