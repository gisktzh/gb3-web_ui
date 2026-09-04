import {forEachChild, isCallExpression, Node, SourceFile, TypeChecker} from 'typescript';
import {StoreSelector} from './types/store-selector';
import {getDefaultValueForType} from './get-default-value-for-type';

export function getStoreSelectors(sourceFile: SourceFile, checker: TypeChecker): StoreSelector[] {
  const storeSelectors: StoreSelector[] = [];

  function visit(node: Node) {
    if (node.getFullText().includes('selectSignal(') && isCallExpression(node)) {
      storeSelectors.push(
        ...node.arguments.map((a) => {
          let defaultArg = 'undefined';

          const type = checker.getTypeAtLocation(a);

          const signatures = type.getCallSignatures();

          if (signatures.length > 0) {
            const returnType = checker.getReturnTypeOfSignature(signatures[0]);
            defaultArg = getDefaultValueForType(returnType, checker);
          }

          return {
            name: a.getFullText(),
            defaultArg,
          };
        }),
      );
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return storeSelectors;
}
