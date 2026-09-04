import {forEachChild, isCallExpression, isPropertyDeclaration, Node, SourceFile, TypeChecker} from 'typescript';
import {ComponentInput} from './types/component-input';
import {getDefaultValueForType} from './get-default-value-for-type';

export function getInputsWithDefaults(sourceFile: SourceFile, checker: TypeChecker): ComponentInput[] {
  const inputs: ComponentInput[] = [];

  function visit(node: Node) {
    if (isPropertyDeclaration(node) && node.initializer && isCallExpression(node.initializer)) {
      const call = node.initializer;

      const exprText = call.expression.getText();

      if (exprText.includes('input')) {
        const name = node.name.getText();

        const typeArg = call.typeArguments?.[0];
        const type = typeArg ? checker.getTypeFromTypeNode(typeArg) : undefined;
        const defaultValue = type ? getDefaultValueForType(type, checker) : 'undefined';

        inputs.push({name, defaultValue});
      }
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return inputs;
}
