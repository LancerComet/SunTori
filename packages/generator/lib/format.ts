const codeFormat = (code: string) => {
  return code.replace(/ {4}/g, '  ')
    .replace(/\r\n/g, '\n')
    .replace(/;/g, '\n')
    .replace(/"/g, '\'')
    .replace(/\n\n}/g, '\n}\n')
    .replace(/}\n\n/g, '}\n')
    .replace(/\n@Serializable/g, '\n\n@Serializable')
}

export {
  codeFormat
}
