import ts from 'typescript'
import { isBoolean, isNumber, isString } from './utils'

const getSyntaxKind = (target: unknown) => {
  if (isNumber(target)) {
    return ts.SyntaxKind.NumberKeyword
  }

  if (isBoolean(target)) {
    return ts.SyntaxKind.BooleanKeyword
  }

  if (isString(target)) {
    return ts.SyntaxKind.StringKeyword
  }

  return ts.SyntaxKind.UnknownKeyword
}

const getInitializer = (target: unknown): ts.Expression => {
  if (isNumber(target)) {
    return ts.factory.createNumericLiteral(0)
  }

  if (isBoolean(target)) {
    return ts.factory.createFalse()
  }

  if (isString(target)) {
    return ts.factory.createStringLiteral('')
  }

  return ts.factory.createNull()
}

const createSerializableDecorator = () => {
  return ts.factory.createDecorator(
    ts.factory.createCallExpression(
      ts.factory.createIdentifier('Serializable'), undefined, []
    )
  )
}

const createJsonPropertyDecorator = (propName: string) => {
  return ts.factory.createDecorator(
    ts.factory.createCallExpression(
      ts.factory.createIdentifier('JsonProperty'),
      undefined,
      [
        ts.factory.createStringLiteral(propName)
      ]
    )
  )
}

const printTsCode = (node: ts.Node): string => {
  const resultFile = ts.createSourceFile(
    'test.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  )

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  })

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    node,
    resultFile
  )

  return result
}

export {
  getSyntaxKind,
  getInitializer,
  createSerializableDecorator,
  createJsonPropertyDecorator,
  printTsCode
}
