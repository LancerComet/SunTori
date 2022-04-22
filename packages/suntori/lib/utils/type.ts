function isArray (target: any): boolean {
  return Object.prototype.toString.call(target) === '[object Array]'
}

function isString (target: any): boolean {
  return typeof target === 'string'
}

function isBoolean (target: any): boolean {
  return typeof target === 'boolean'
}

function isNumber (target: any): boolean {
  return typeof target === 'number'
}

function isUndefined (target: any): boolean {
  return typeof target === 'undefined'
}

function isFunction (target: any): boolean {
  return typeof target === 'function'
}

function isNull (target: any): boolean {
  return target === null
}

export {
  isArray,
  isString,
  isBoolean,
  isNumber,
  isUndefined,
  isFunction,
  isNull
}
