const isString = (target: unknown): target is string => {
  return typeof target === 'string'
}

const isNumber = (target: unknown): target is number => {
  return typeof target === 'number'
}

const isBoolean = (target: unknown): target is boolean => {
  return typeof target === 'boolean'
}

export {
  isString,
  isNumber,
  isBoolean
}
