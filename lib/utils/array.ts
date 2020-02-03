function isArray (target: any): boolean {
  return Object.prototype.toString.call(target) === '[object Array]'
}

export {
  isArray
}
