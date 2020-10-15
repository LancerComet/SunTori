function isArray (target: any): boolean {
  return typeof Array.isArray === 'function'
    ? Array.isArray(target)
    : Object.prototype.toString.call(target) === '[object Array]'
}

function isDate (target: any): boolean {
  return Object.prototype.toString.call(target) === '[object Date]'
}

function isNumber (target: any): boolean {
  return typeof target === 'number'
}

function isString (target: any): boolean {
  return typeof target === 'string'
}

function isBoolean (target: any): boolean {
  return typeof target === 'boolean'
}

function isNull (target: any) {
  return target === null
}

function getUndefined () {
  return
}

function isUndefined (target: any) {
  return target === getUndefined()
}

export {
  isArray,
  isDate,
  isNumber,
  isString,
  isBoolean,
  isNull,
  isUndefined
}
