import {parseTemplate, TmplAstElement, TmplAstNode} from '@angular/compiler';

export function templateUsesRouter(template: string): boolean {
  const parsed = parseTemplate(template, 'component.html');

  let found = false;

  function visit(node: TmplAstNode) {
    if (found) {
      return;
    }

    if (node instanceof TmplAstElement) {
      if (node.name === 'router-outlet') {
        found = true;
        return;
      }

      if (node.inputs.some((i) => i.name === 'routerLink' || i.name === 'routerLinkActive')) {
        found = true;
        return;
      }

      node.children.forEach(visit);
    }
  }

  parsed.nodes.forEach(visit);

  return found;
}
