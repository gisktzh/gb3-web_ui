import {forEachChild, isCallExpression, isPropertyAccessExpression, Node, SourceFile} from 'typescript';

export function getCalledMethods(sourceFile: SourceFile, propertyName: string) {
  const methods = new Set<string>();

  function visit(node: Node) {
    if (isCallExpression(node)) {
      const expr = node.expression;

      if (isPropertyAccessExpression(expr) && isPropertyAccessExpression(expr.expression) && expr.expression.name.text === propertyName) {
        methods.add(expr.name.text);
      }
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return [...methods];
}
