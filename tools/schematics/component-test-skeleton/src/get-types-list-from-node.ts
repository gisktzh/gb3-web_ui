import {
  IntersectionTypeNode,
  isCallExpression,
  isIdentifier,
  isPropertyDeclaration,
  Node,
  TypeReferenceNode,
  UnionTypeNode,
} from 'typescript';
import {NestedTypeArguments} from './types/nested-type-arguments';

function isUnionOrIntersectionTypeNode(typeReferenceNode: object): typeReferenceNode is UnionTypeNode | IntersectionTypeNode {
  return Object.prototype.hasOwnProperty.call(typeReferenceNode, 'types');
}

function getNestedTypeArguments(typeReferenceNode: TypeReferenceNode | UnionTypeNode | IntersectionTypeNode): NestedTypeArguments {
  if (isUnionOrIntersectionTypeNode(typeReferenceNode)) {
    return {
      typeNames: typeReferenceNode.types.map((t) => t.getFullText().trim()),
      nested: [],
    };
  }

  return {
    typeNames: [typeReferenceNode.typeName.getFullText()],
    nested: typeReferenceNode.typeArguments?.map((t) => getNestedTypeArguments(t as TypeReferenceNode)) || [],
  };
}

function getTypesListFromNested(nestedTypeArgumentsList: NestedTypeArguments[]): string[] {
  return nestedTypeArgumentsList.flatMap((t) => [t.typeNames, getTypesListFromNested(t.nested)]).flat();
}

export function getTypesListFromNode(node: Node): string[] {
  if (
    isPropertyDeclaration(node) &&
    node.initializer &&
    isCallExpression(node.initializer) &&
    isIdentifier(node.initializer.expression) &&
    node.initializer &&
    node.initializer.typeArguments
  ) {
    const nestedTypeArguments = node.initializer.typeArguments.map((t) => getNestedTypeArguments(t as TypeReferenceNode));
    return getTypesListFromNested(nestedTypeArguments);
  }

  return [];
}
