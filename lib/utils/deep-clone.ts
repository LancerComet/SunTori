function deepClone<T> (target: T): T {
  if (Array.isArray(target)) {
    return target.map(item => deepClone(item)) as any
  }

  switch (typeof target) {
    case 'function':
      return function (...args) {
        return target.call(this, ...args)
      } as any

    case 'object':
      const result: any = {}
      Object.keys(target).forEach(key => {
        result[key] = deepClone(target[key])
      })
      return result

    default:
      return target
  }
}

export {
  deepClone
}
