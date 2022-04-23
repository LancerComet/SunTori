import jsonParse, { ObjectNode } from 'json-to-ast'
import ts from 'typescript'
import camelcase from 'camelcase'
import { pascalCase } from 'pascal-case'
import {
  createJsonPropertyDecorator,
  createSerializableDecorator,
  getInitializer,
  getSyntaxKind,
  printTsCode
} from './tsc'
import { codeFormat } from './format'

const getJsonString = (jsonObject: unknown): string => {
  try {
    return JSON.stringify(jsonObject)
  } catch (error) {
    throw new Error('Invalid json object was provided. Please check your json format.')
  }
}

const walkObjectNode = (
  className: string,
  node: ObjectNode,
  useCamelCase: boolean,
  addReadonly: boolean
): ts.ClassDeclaration[] => {
  const members: ts.ClassElement[] = []
  const classDefs: ts.ClassDeclaration[] = []

  for (const child of node.children) {
    const jsonKey = child.key.value
    const jsonValueNode = child.value

    const classKeyName = useCamelCase
      ? camelcase(jsonKey)
      : jsonKey

    const modifiers = addReadonly
      ? [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)]
      : []

    if (jsonValueNode.type === 'Literal') {
      members.push(
        ts.factory.createPropertyDeclaration(
          [createJsonPropertyDecorator(jsonKey)],
          modifiers,
          ts.factory.createIdentifier(classKeyName),
          undefined,
          ts.factory.createKeywordTypeNode(
            getSyntaxKind(jsonValueNode.value)
          ),
          getInitializer(jsonValueNode.value)
        )
      )
      continue
    }

    if (jsonValueNode.type === 'Object') {
      const childClassName = `${className}${pascalCase(jsonKey)}`
      classDefs.push(...walkObjectNode(childClassName, jsonValueNode, useCamelCase, addReadonly))
      members.push(
        ts.factory.createPropertyDeclaration(
          [createJsonPropertyDecorator(jsonKey)],
          modifiers,
          ts.factory.createIdentifier(classKeyName),
          undefined,
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier(childClassName),
            undefined
          ),
          ts.factory.createNewExpression(
            ts.factory.createIdentifier(childClassName),
            undefined,
            []
          )
        )
      )
      continue
    }

    if (jsonValueNode.type === 'Array') {
      const arrayFirstChildNode = jsonValueNode.children[0]
      if (!arrayFirstChildNode) {
        members.push(
          ts.factory.createPropertyDeclaration(
            [createJsonPropertyDecorator(jsonKey)],
            modifiers,
            ts.factory.createIdentifier(classKeyName),
            undefined,
            ts.factory.createArrayTypeNode(
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
            ),
            ts.factory.createArrayLiteralExpression([], false)
          )
        )
        continue
      }

      if (arrayFirstChildNode.type === 'Literal') {
        members.push(
          ts.factory.createPropertyDeclaration(
            [createJsonPropertyDecorator(jsonKey)],
            modifiers,
            ts.factory.createIdentifier(classKeyName),
            undefined,
            ts.factory.createArrayTypeNode(
              ts.factory.createKeywordTypeNode(
                getSyntaxKind(arrayFirstChildNode.value)
              )
            ),
            ts.factory.createArrayLiteralExpression([], false)
          )
        )
        continue
      }

      if (arrayFirstChildNode.type === 'Object') {
        const childClassName = `${className}${pascalCase(jsonKey)}`
        classDefs.push(...walkObjectNode(childClassName, arrayFirstChildNode, useCamelCase, addReadonly))

        const childClassIdentifier = ts.factory.createIdentifier(childClassName)

        members.push(
          ts.factory.createPropertyDeclaration(
            [
              ts.factory.createDecorator(
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier('JsonProperty'),
                  undefined,
                  [
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier('name'),
                          ts.factory.createStringLiteral(jsonKey)
                        ),
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier('type'),
                          childClassIdentifier
                        )
                      ],
                      false
                    )
                  ]
                )
              )
            ],
            modifiers,
            ts.factory.createIdentifier(classKeyName),
            undefined,
            ts.factory.createArrayTypeNode(
              ts.factory.createTypeReferenceNode(
                childClassIdentifier, undefined
              )
            ),
            ts.factory.createArrayLiteralExpression([], false)
          )
        )
      }
    }
  }

  classDefs.push(ts.factory.createClassDeclaration(
    [createSerializableDecorator()],
    undefined,
    ts.factory.createIdentifier(className),
    undefined,
    undefined,
    members
  ))

  return classDefs
}

/**
 * Generate SunTori codes.
 */
const generate = async (param: {
  /**
   * JSON object.
   *
   * @type {never}
   */
  jsonObject: any

  /**
   * Classname for the entire json.
   *
   * @type {[string]}
   * @default Root
   */
  rootClassName?: string

  /**
   * Use `camelCase` during code generation.
   *
   * @type {[boolean]}
   * @default true
   */
  useCamelCase?: boolean

  /**
   * Add `readonly` modifier to all members of a class.
   *
   * @type {[boolean]}
   * @default false
   */
  addReadonly?: boolean
}): Promise<string> => {
  const jsonObject = param.jsonObject
  const rootClassName = param.rootClassName ?? 'Root'
  const useCamelCase = param.useCamelCase ?? true
  const addReadonly = param.addReadonly ?? false

  if (typeof jsonObject !== 'object') {
    throw new Error('A JSON object must be provided.')
  }

  const jsonString = getJsonString(jsonObject)
  const rootValueNode = jsonParse(jsonString)

  if (rootValueNode.type !== 'Object') {
    throw new Error('The root element must be an object-typed json.')
  }

  let result = ''
  const classDefs = walkObjectNode(
    rootClassName, rootValueNode,
    useCamelCase, addReadonly
  )
  classDefs.forEach(item => {
    result += printTsCode(item) + '\n'
  })

  try {
    return codeFormat(result)
  } catch (error) {
    throw new Error('Failed to format code: ' + (error as Error).message)
  }
}

export {
  generate
}
