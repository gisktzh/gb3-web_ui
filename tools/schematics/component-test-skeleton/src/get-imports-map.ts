import {isImportDeclaration, isNamedImportBindings, Node, SourceFile, forEachChild, isNamespaceImport} from 'typescript';

export function getImportsMap(sourceFile: SourceFile) {
  const imports: Map<string, string> = new Map();

  function visit(node: Node) {
    if (isImportDeclaration(node)) {
      // node.moduleSpecifier
      if (
        node.importClause?.namedBindings &&
        isNamedImportBindings(node.importClause.namedBindings) &&
        !isNamespaceImport(node.importClause.namedBindings)
      ) {
        node.importClause?.namedBindings.elements
          .map((el) => el.getFullText())
          .forEach((el) => {
            imports.set(el.trim(), node.moduleSpecifier.getText().replace(/['"]/g, ''));
          });
      }
    }

    forEachChild(node, visit);
  }

  visit(sourceFile);

  return imports;
}
