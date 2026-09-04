import {
  Call,
  PropertyRead,
  RecursiveAstVisitor,
  TmplAstNode,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstTemplate,
  parseTemplate,
} from '@angular/compiler';

class MethodCollector extends RecursiveAstVisitor {
  constructor(
    private readonly propertyName: string,
    private readonly methods: Set<string>,
  ) {
    super();
  }

  public override visitCall(ast: Call): void {
    const receiver = ast.receiver;

    if (receiver instanceof PropertyRead && receiver.receiver instanceof PropertyRead && receiver.receiver.name === this.propertyName) {
      this.methods.add(receiver.name);
    }

    super.visitCall(ast, undefined);
  }
}

function visitTemplateNode(node: TmplAstNode, propertyName: string, methods: Set<string>): void {
  const collector = new MethodCollector(propertyName, methods);

  if (node instanceof TmplAstBoundEvent) {
    node.handler.visit(collector);
  }

  if (node instanceof TmplAstBoundAttribute) {
    node.value.visit(collector);
  }

  if (node instanceof TmplAstElement) {
    node.inputs.forEach((i) => i.value.visit(collector));
    node.outputs.forEach((o) => o.handler.visit(collector));

    node.children.forEach((c) => visitTemplateNode(c, propertyName, methods));
  }

  if (node instanceof TmplAstTemplate) {
    node.templateAttrs.forEach((a) => {
      if ('value' in a && a.value && typeof a.value !== 'string') {
        a.value.visit(collector);
      }
    });

    node.children.forEach((c) => visitTemplateNode(c, propertyName, methods));
  }
}

export function getCalledMethodsFromTemplate(templateContent: string, propertyName: string): string[] {
  const methods = new Set<string>();

  const parsed = parseTemplate(templateContent, 'component.html');

  parsed.nodes.forEach((n) => visitTemplateNode(n, propertyName, methods));

  return [...methods];
}
