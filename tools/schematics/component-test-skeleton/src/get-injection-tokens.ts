import {forEachChild, isCallExpression, isIdentifier, isPropertyDeclaration, Node, SourceFile} from 'typescript';
import {getTypesListFromNode} from './get-types-list-from-node';
import {InjectionToken} from './types/injection-token';

export function getInjectionTokens(sourceFile: SourceFile): InjectionToken[] {
  const injectionTokens: InjectionToken[] = [];

  function visit(node: Node) {
    if (
      isPropertyDeclaration(node) &&
      node.initializer &&
      isCallExpression(node.initializer) &&
      isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === 'inject'
    ) {
      const tokenName = node.initializer.arguments.map((t) => t.getFullText())[0];
      const injectionToken = {
        tokenName,
        propertyName: node.name.getFullText().trim(),
        typeArgumentsList: getTypesListFromNode(node),
        fullTypeArg: node.initializer.typeArguments?.map((t) => t.getFullText()).join(', '),
      };

      if (!tokenName.includes('_')) {
        injectionToken.typeArgumentsList = [...new Set([...injectionToken.typeArgumentsList, tokenName])];
      }

      injectionTokens.push(injectionToken);
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return injectionTokens;
}
