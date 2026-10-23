# Component testing

Component tests protect user-visible Angular behavior without requiring a real browser or backend. They run with Vitest and `happy-dom`; browser rendering, ArcGIS integration, layout measurements, iframe behavior, and CSS appearance remain Playwright concerns.

## What to test

Add a dedicated component spec when a component owns at least one observable contract:

- inputs, outputs, models, or content projection;
- conditional or repeated rendering;
- forms, validation, dialogs, loading, success, or error states;
- store selectors, dispatched actions, service calls, routing, or browser APIs;
- focus, keyboard, accessibility, or disabled behavior;
- non-trivial bindings to child components.

Test rendered behavior and externally observable effects. A creation-only test does not count. Avoid assertions on private fields, implementation-only methods, Angular-generated markup, or exact CSS class structures unless the class itself is a documented contract.

A component does not need its own spec when it is an abstract base, a styling-only leaf, an empty projection/routing shell, or its meaningful behavior requires a real browser. Such components must still be classified in the inventory with a concrete implementation, host, or Playwright test as evidence.

## Test boundaries

- Keep lightweight presentational children real. Stub map, ArcGIS, or independently tested feature boundaries when their setup would obscure the parent behavior.
- Use Angular's `inputBinding`, `outputBinding`, and `twoWayBinding` APIs for signal-based bindings. Drive native controls through DOM events.
- Use Angular Material/CDK component harnesses for Material controls. Prefer semantic DOM queries for native elements and stable test IDs only when no semantic selector is practical.
- Do not make private production state public or change production behavior for a test. Exercise the public API or rendered contract instead.
- Test ArcGIS rendering, dimensions, CSS appearance, iframe behavior, and other real-browser contracts in Playwright. A map-owning component can still have a component spec for lifecycle and orchestration.

## Recommended setup

Use a small setup factory per spec to keep the behavior under test visible:

```typescript
const setup = async () => {
  await TestBed.configureTestingModule({
    imports: [ExampleComponent],
    providers: [provideMockStore()],
  }).compileComponents();

  const fixture = TestBed.createComponent(ExampleComponent, {
    bindings: [inputBinding('label', () => 'Example')],
  });
  fixture.detectChanges();

  return {fixture, component: fixture.componentInstance};
};
```

Keep setup defaults valid and override only what a scenario needs. Assert the initial state, interaction, and outcome in the same test rather than duplicating implementation branches.

### NgRx and asynchronous behavior

- Use `provideMockStore` and override only selectors relevant to the scenario.
- Refresh the mock state and run change detection after changing selector values.
- Assert dispatched public actions rather than reducer or selector internals.
- Use `vi.useFakeTimers()` only when the component owns time-dependent behavior. Restore real timers after each test and advance only the duration required by the contract.
- Await harness calls, promises, and Angular stabilization explicitly. Do not use arbitrary sleeps.

### Drag, drop, and file input

Dispatch realistic DOM events and provide the minimum browser data object required by the component. File selection remains a direct TestBed DOM interaction because portable CDK `TestElement` event data cannot represent a `FileList` reliably.

## Coverage inventory

[`component-test-inventory.yaml`](./component-test-inventory.yaml) is the source of truth for component-test rollout. Every `src/app/**/*.component.ts` file appears exactly once in one of these groups:

- `pending`: no approved coverage strategy has been completed yet;
- `dedicated`: covered by its own meaningful component spec;
- `host`: intentionally exercised through a named parent, host, or route;
- `e2e`: meaningful behavior requires a real browser and is covered by Playwright;
- `abstract`: exercised through named concrete implementations.

“Full component coverage” means zero `pending` entries with valid evidence for every other category. It does not mean 100% line coverage, and a trivial spec does not satisfy it.

Run the inventory commands from the repository root:

```shell
npm run component-tests:sync
npm run component-tests:check
```

`component-tests:sync` discovers new components, adds them to `pending`, preserves existing classifications, sorts the YAML deterministically, and reports stale entries without deleting them. `component-tests:check` is read-only and fails for missing, duplicate, stale, invalid, or unresolved evidence entries. CI runs the read-only check.

The inventory script itself is covered by `scripts/component-test-inventory.test.mjs` (`npm run component-tests:test`), which uses Node's built-in test runner against temporary fixture repositories.

Use `npm run component-tests:check-complete` only when closing the rollout; it additionally fails while any component remains `pending`.

## Rollout work packages

Deliver each domain package as a reviewable PR. Each PR updates the inventory, adds or references meaningful coverage, and passes the relevant focused tests; the closing package validates the complete test suite, lint, Knip, and application build.

| Package | Focus                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| WP0     | Inventory, classification rules, synchronization, and CI validation                                                                        |
| WP1     | Reference pilot: page section, search input, expandable list item, drop zone, favourite dialog, feature info overlay, and active map items |
| WP2     | Remaining shared UI, navigation, lists, and layout components                                                                              |
| WP3     | Start, support, privacy, terms, authentication, error, onboarding, and application pages                                                   |
| WP4     | Data catalogue pages, details, filters, and displays                                                                                       |
| WP5     | Map navigation, controls, catalogue, search, and active-item components                                                                    |
| WP6     | Feature information, legends, overlays, elevation, and attribute filters                                                                   |
| WP7     | Drawing, symbol, and drawing-edit components                                                                                               |
| WP8     | Map tools, imports, downloads, dialogs, sharing, measurement, and time controls                                                            |
| WP9     | Resolve remaining inventory gaps, remove obsolete tests, and validate the complete suite                                                   |

New components must be added to the inventory in the same PR. Changed behavior must update its dedicated, host, or E2E coverage. Numeric component-coverage thresholds remain deferred until the inventory reaches zero `pending`.

## Commands

```shell
# Full unit suite
npm test -- --watch=false

# One component spec
npm test -- --watch=false --include=src/app/path/example.component.spec.ts

# CI coverage artifact
npm run test-ci
```

Coverage continues to support Sonar reporting. Component source files are included now that the inventory has reached zero `pending`; numeric thresholds remain deferred until the team has reviewed a stable baseline.
