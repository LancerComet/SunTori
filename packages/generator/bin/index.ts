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
} from './utils'

const getJsonString = (jsonObject: unknown): string => {
  try {
    return JSON.stringify(jsonObject)
  } catch (error) {
    throw new Error('Invalid json object was provided. Please check your json format.')
  }
}

const main = (rootJsonObject: unknown) => {
  if (typeof rootJsonObject !== 'object') {
    throw new Error('A JSON object must be provided.')
  }

  const jsonString = getJsonString(rootJsonObject)
  const rootValueNode = jsonParse(jsonString)

  if (rootValueNode.type !== 'Object') {
    throw new Error('The root element must be an object-typed json.')
  }

  let result = ''
  const classDefs = walkObjectNode('Root', rootValueNode)
  classDefs.forEach(item => {
    result += printTsCode(item) + '\n\n'
  })
  console.log(result)
}

const walkObjectNode = (className: string, node: ObjectNode): ts.ClassDeclaration[] => {
  const members: ts.ClassElement[] = []
  const classDefs: ts.ClassDeclaration[] = []

  for (const child of node.children) {
    const jsonKey = child.key.value
    const jsonValueNode = child.value

    if (jsonValueNode.type === 'Literal') {
      members.push(
        ts.factory.createPropertyDeclaration(
          [createJsonPropertyDecorator(jsonKey)],
          undefined,
          ts.factory.createIdentifier(camelcase(jsonKey)),
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
      classDefs.push(...walkObjectNode(childClassName, jsonValueNode))
      continue
    }

    if (jsonValueNode.type === 'Array') {
      const arrayFirstChildNode = jsonValueNode.children[0]
      if (!arrayFirstChildNode) {
        members.push(
          ts.factory.createPropertyDeclaration(
            [createJsonPropertyDecorator(jsonKey)],
            undefined,
            ts.factory.createIdentifier(camelcase(jsonKey)),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createArrayLiteralExpression([], false)
          )
        )
        continue
      }

      if (arrayFirstChildNode.type === 'Literal') {
        members.push(
          ts.factory.createPropertyDeclaration(
            [createJsonPropertyDecorator(jsonKey)],
            undefined,
            ts.factory.createIdentifier(camelcase(jsonKey)),
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
        classDefs.push(...walkObjectNode(childClassName, arrayFirstChildNode))

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
            undefined,
            ts.factory.createIdentifier(camelcase(jsonKey)),
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

  const classDef = ts.factory.createClassDeclaration(
    [createSerializableDecorator()],
    undefined,
    ts.factory.createIdentifier(className),
    undefined,
    undefined,
    members
  )
  classDefs.push(classDef)

  return classDefs
}

main({
  name: 'John Smith',
  age: 100,
  is_dead: true,
  addresses: [
    {
      name: 'Home',
      location: 'The earth'
    }
  ],
  numbers: [1, 2, 3],
  type: null,
  meta: {
    bulk: { is_finished: true },
    closed: false
  }
})
