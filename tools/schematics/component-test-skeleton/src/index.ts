import path from 'node:path';
import {type Rule, type SchematicContext, Tree, apply, url, move, mergeWith, applyTemplates} from '@angular-devkit/schematics';
import {strings, normalize} from '@angular-devkit/core';
import {createProgram, findConfigFile, parseJsonConfigFileContent, readConfigFile, sys} from 'typescript';
import {getInjectionTokens} from './get-injection-tokens';
import {getStoreSelectors} from './get-store-selectors';
import {getImportsMap} from './get-imports-map';
import {getCalledMethods} from './get-called-methods';
import {getCalledMethodsFromTemplate} from './get-called-methods-from-template';
import {templateUsesRouter} from './template-uses-router';
import {getInputsWithDefaults} from './get-inputs';
import {getOutputs} from './get-outputs';

export interface SchemaOptions {
  path: string;
}

export function componentTest(options: SchemaOptions): Rule {
  return (_: Tree, _context: SchematicContext) => {
    const componentTsPath = options.path;
    const componentTsFileName = path.basename(options.path);
    const componentName = componentTsFileName.split('.component.ts')[0];
    const targetPath = normalize(`${options.path}`).replace(componentTsFileName, '');

    const configPath = findConfigFile(process.cwd(), sys.fileExists, 'tsconfig.json');

    if (!configPath) {
      throw new Error('Could not find tsconfig.json');
    }

    const configFile = readConfigFile(configPath, sys.readFile);
    const parsedConfig = parseJsonConfigFileContent(configFile.config, sys, path.dirname(configPath));
    const program = createProgram(parsedConfig.fileNames, parsedConfig.options);
    const checker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(componentTsPath);
    if (!sourceFile) {
      throw new Error(`Could not load ${componentTsPath} into TypeScript program`);
    }

    const componentHtmlPath = componentTsPath.replace('.component.ts', '.component.html');
    const templateContent = sys.fileExists(componentHtmlPath) ? (sys.readFile(componentHtmlPath) ?? '') : '';

    // Gather info about the component
    const injectionTokens = getInjectionTokens(sourceFile);
    const storeSelectors = getStoreSelectors(sourceFile, checker);
    const imports = getImportsMap(sourceFile);
    const inputs = getInputsWithDefaults(sourceFile, checker);
    const outputs = getOutputs(sourceFile);

    // Provide info for the template
    const calledMethodsOnStore = [
      ...new Set([...getCalledMethods(sourceFile, 'store'), ...getCalledMethodsFromTemplate(templateContent, 'store')]),
    ];

    const analysis = {
      usesStore: injectionTokens.some((t) => t.tokenName === 'Store'),
      usesStoreDispatching: calledMethodsOnStore.includes('dispatch'),
      usesRouter:
        injectionTokens.some((t) => t.tokenName === 'Router' || t.tokenName === 'ActivatedRoute') || templateUsesRouter(templateContent),
    };
    let necessaryImports = '';
    let mockDeclarations = '';
    let overriddenSelectors = '';
    let providerConfig = '';
    let inputBindings = '';
    let outputSpies = '';

    // Build up and override selectors
    storeSelectors.forEach((selector) => {
      if (!imports.has(selector.name)) {
        throw new Error(`Import for selector ${selector.name} is missing in source component?`);
      }

      necessaryImports += `import {${selector.name}} from '${imports.get(selector.name)}'\n`;
      overriddenSelectors += `    store.overrideSelector(${selector.name}, ${selector.defaultArg});\n`;
    });

    if (overriddenSelectors.length > 0) {
      overriddenSelectors = `  store = TestBed.inject(MockStore);\n${overriddenSelectors}  store.refreshState();\n`;
    }

    // Provide injection tokens, except for store, which is handled separately.
    injectionTokens
      .filter((t) => t.tokenName !== 'Store' && t.tokenName !== 'Router' && t.tokenName !== 'ActivatedRoute')
      .forEach((t) => {
        t.typeArgumentsList.forEach((type) => {
          if (imports.has(type)) {
            necessaryImports += `import {${type}} from '${imports.get(type)}'\n`;
          }
        });

        const calledMethods = [
          ...new Set([...getCalledMethods(sourceFile, t.propertyName), ...getCalledMethodsFromTemplate(templateContent, t.propertyName)]),
        ]
          .map((m) => `\n    ${m}: vi.fn()`)
          .join(',');

        mockDeclarations += `  const ${t.propertyName}Mock: Partial<${t.fullTypeArg ?? t.tokenName}> = {${calledMethods}};`;
        providerConfig += `{ provide: ${t.tokenName}, useValue: ${t.propertyName}Mock },\n`;
      });

    // Add input bindings
    inputBindings = inputs.map((i) => `inputBinding('${i.name}', ${i.name})`).join(',');
    if (inputBindings.length > 0) {
      inputBindings = `, {
        bindings: [
          ${inputBindings}
        ],
      }`;

      mockDeclarations += `  ${inputs.map((i) => `const ${i.name} = signal(${i.defaultValue})`).join('\n')}`;
    }

    // Add output spies
    outputSpies = outputs.map((o) => `${o.name}Spy = vi.spyOn(component.${o.name}, 'emit');`).join('\n');
    if (outputSpies.length > 0) {
      mockDeclarations += `\n${outputs.map((o) => `  let ${o.name}Spy: Mock;`).join('\n')}`;
      necessaryImports += `import {Mock} from 'vitest';\n`;
    }

    const sourceTemplates = apply(url('../files'), [
      applyTemplates({
        ...strings,
        options: {
          ...options,
          componentName,
        },
        componentName,
        analysis,
        necessaryImports,
        providerConfig,
        mockDeclarations,
        overriddenSelectors,
        inputBindings,
        outputSpies,
      }),
      move(targetPath),
    ]);

    return mergeWith(sourceTemplates);
  };
}
