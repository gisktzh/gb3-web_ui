import {forEachChild, isCallExpression, isPropertyDeclaration, Node, SourceFile} from 'typescript';
import {ComponentOutput} from './types/component-output';

export function getOutputs(sourceFile: SourceFile): ComponentOutput[] {
  const inputs: ComponentOutput[] = [];

  function visit(node: Node) {
    if (isPropertyDeclaration(node) && node.initializer && isCallExpression(node.initializer)) {
      const call = node.initializer;

      const exprText = call.expression.getText();

      if (exprText.includes('output')) {
        inputs.push({name: node.name.getText()});
      }
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return inputs;
}
