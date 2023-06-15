# Gb3Poc

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

## Installation

- Husky

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you
change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also
use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a
package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out
the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Docker

### Building the image

The docker image has to be built for each environment separately, since we cannot use runtime environment
configurations.

In order to build the docker image use the following command (adjust tag as needed):

```
docker build --no-cache --build-arg TARGET_ENVIRONMENT={target_environment} -t gb3-frontend:latest .
```

- **gb3-frontend** is the name of the image
- **latest** is the tag used to mark the version of this image
- **target_environment** is the target build environment, which is one of the following:
  - `local`: Default if this variable is missing; localhost development
  - `local-gb2`: localhost development with locally deployed GB2 backend
  - `dev-ebp`: production deployment for EBP environment
  - `staging`: production deployment for KTZH staging environment
  - `staging-using-productive-gb2-backend`: production deployment for KTZH staging environment which uses the productive
    GB2 backend infrastructure.
  - `uat`: production deployment for KTZH UAT environment
  - `production`: production deployment for KTZH production (internet & intranet) environment

The `target_environment` is used to create environment specific build outputs so as to not divulge sensitive information
such as internal domains. This is mainly reflected in the runtime configuration mechanism described below.

### Run the image

This image exposes port 8080 and can be run like this:

```
docker run -p 80:8080 gb3-frontend:latest
```

- **80:8080** maps the internal port 8080 to the external port 80; the later can be chosen freely
- **gb3-frontend** is the name of the image
- **latest** is the version tag for this image

## Local Backend

### Using local GB2 setup

If you're using a local GB2 setup (e.g. via docker), you can use this backend by
running `ng serve --configuration=development-local-gb2` (or `npm run start-local-gb2` shorthand). This assumes that

- GB2 runs on localhost, port 3000, exposing **all** services from GB2 (wms, tokens, etc.)
- GB2 is accessible from your host

If using this, angular will proxy all requests to the GB2 via localhost, so you have to set all links to be relative (
e.g. `/wms/asd` will become `http://localhost:4200/wms/asd`, and then proxied to `http://localhost:3000/wms/asd`).

## Naming conventions

WIP - add more naming conventions :)

### Branchname and commit message

Whenever possible, a Jira ticket should be referenced in both branchname and commit message:

- Branches: `[feature|hotfix]/gb3-[xxx]-[name-of-branch]`, where `xxx` refers to a Jira ticket and the `name-of-branch`
  is a short summary of the feature/hotfix.`
- Commits: `GB3-[xxx]: Your commit message`, , where `xxx` refers to a Jira ticket

Our githooks check for both the branch name and the commit message, but they will only output a warning if they don't
match. This is because there are times when you _might_ want to deviate from these rules.

## Code documentation

### The `ActiveMapItem` class

The heart of the application is the `ActiveMapItem` class. All data the user can add to the map (and reorder, toggle
visibility, interact with in terms of settings, etc.) is an instance of the abstract `ActiveMapItem` class.
All `ActiveMapItem`s are available in the `ActiveMapItemState`. In order for the map to correctly render the state,
the `MapService` implementation has to be synchronized with the state: If e.g. an item is added, the `MapService` has to
handle this accordingly: Create a new framework-dependent instance of the layer, add it to the map, handle ordering,
etc.

#### Usage

The `ActiveMapItem` is an abstract class; the actual implementation is delegated to subclasses within
the `implementations` subfolder, representing different
types of layers that can be added to a map, such as `Gb2WmsActiveMapItem`. Since configuration for these layers differs,
the `ActiveMapItem` has a property `configuration` which is a discriminated union type `ActiveMapItemConfiguration`,
holding all layer configurations. This allows for a flexible combination of `ActiveMapItem`s and their configurations.

As a variation of the [visitor pattern](https://refactoring.guru/design-patterns/visitor), the `ActiveMapItem` also has
an abstract method `addToMap` which the subclasses need to imlement - this method is responsible for adding a given
instance of `ActiveMapItem` to the map by using the appropriate method on the `AddToMapVisitor` interface.

In order to avoid the `Array.filter(m => m instanceof x).map(m => m as x)` pattern, the `isActiveMapItemOfType`
typeguard can be used: `Array.filter(isActiveMapItemOfType(x))`.

### Spatial Reference System(s)

Because we're using different datasources, we cannot always determin what SRS our GeoJSON objects have. In order to
specify the SRS of a given GeoJSON object, use the wrapper classes defined
in `src/app/shared/interfaces/geojson-types-with-srs.interface.ts` which also specify the SRS.

All supported SRS in our app are defined as `SupportedSrs` type.

Using these helper interfaces and types allows us to properly leverage Esri's built-in transformation services without
relying on the implicit conversion of coordinates. As such, whenever possible, we should not rely on the `geojson`
package itself, but rather on its wrapper classes.

### State

All application-wide state is handled by [NGRX](https://ngrx.io/).

TODO: Explain our state in detail :)

#### Mutating nested state

As of now, we still have (deeply) nested state and for as long as we do not normalize our state, this will pose some
challenges, namely that mutating the state in reducers requires a deep copy of the current state object. Luckily,
there's a nifty package called [immer](https://immerjs.github.io/immer/) that helps working with mutable objects. All it
does is leverage [Proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
to create "clever" deep copies. Inside its lifecycle, you can mutate the object as if it were mutable, yet it becomes
immutable once it is returned. It also is more performant than
e.g. [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) because it keeps track of what
has changed and only changes (deeply) nested objects if they actually did change.

Apart from performance considerations (which could be further optimized by restructuring our state and/or our reducers),
the main reason for introducting `immer` was that our typings broke with `rxjs > 7.8.x` in that using `structuredClone`
broke type recognition in Angular's compiler, leading to an inconsistent state between IDE and tooling. So it was either
using a proper library (as recommended by `ngrx` (!)) or adding `xxx as xyz` typecasts after each `structuredClone`.

##### Example

Let's take our `ActiveMapItemState` as an example, which is the state that is most deeply nested:

```typescript
export interface ActiveMapItemState {
  activeMapItems: ActiveMapItem[];
}
```

A simple reducer for updating the visibility on a given `ActiveMapItem` would look like this:

```typescript
on(ActiveMapItemActions.setVisibility, (state, {visible, activeMapItem}): ActiveMapItemState => {
  const activeMapItems = state.activeMapItems.map((mapItem) => {
    if (mapItem.id === activeMapItem.id) {
      const newActiveMapItem = structuredClone(mapItem);
      newActiveMapItem.visible = visible;
      return newActiveMapItem;
    }
    return mapItem;
  });
  return {...state, activeMapItems: [...activeMapItems]};
});
```

Not only does it copy the whole object, it also requires a verbose `Array.map` operation. With `immer`, we can inject
its `produce` function directly in the `on()` parameters, like so:

```typescript
on(
  ActiveMapItemActions.setVisibility,
  produce((draft, {visible, activeMapItem}) => {
    draft.activeMapItems.forEach((mapItem) => {
      if (mapItem.id === activeMapItem.id) {
        mapItem.visible = visible;
      }
    });
  })
);
```

This yields the same result as the first example, but it is much more readable and more in a functional programming
style. All it does is creating a proxy object of our state (clarified by using `draft` and not `state`), which can then
be directly modified using `Array.forEach` - and then,
the [result is returned automatically](<https://immerjs.github.io/immer/return#:~:text=It%20is%20not%20needed%20to%20return%20anything%20from%20a%20producer%2C%20as%20Immer%20will%20return%20the%20(finalized)%20version%20of%20the%20draft%20anyway.%20However%2C%20it%20is%20allowed%20to%20just%20return%20draft>).

##### Using `immer` with ES6 classes

The above workflow works for all basic `Object` types as well as interfaces. As soon as ES6 classes are involved, they
need to be [marked as such](https://immerjs.github.io/immer/complex-objects). For convenience, we have a `IsImmerable`
interface available that encapsulates this behaviour. Note that if you fail to do so, you will
get `Cannot assign to read only property xxxx of object` errors, because these class instances are not `immer`ized.

##### Conventions

Some conventions exist and should be adhered to when dealing with immutable state mutations:

- Always use the `immer` approach - do not use things like `lodash` or `structuredClone`.
- In reducers, always try to add the `produce` call at the top-most level to avoid nasty sideeffects.
- Most likely, you can add the call at the `on` parameter level as in the example above.
  - If so, name the state variable `draft` to signal to the user that this is mutable.
- Only use `immer` when it is actually needed - if you don't modify deeply nested states, you're most likely not going
  to need it.

### Runtime configurations

The app supports multiple environments with different endpoints. Because the production deployment has different
endpoints depending on whether it is access via internet or intranet, these URLs need to be added during runtime, so
Angular's environment files do not work.

As a workaround, the `ConfigService` can be used. This service will check the current hostname and return the given API
configurations. The replacements are done (similar to the environment configurations) as part of the `angular.json`
build file replacements.

The configurations are found in `src/app/shared/configs/runtime.config.ts` and configured via their environment
replacement files.

#### Available URL configurations

| Stagename |      Subdomain      |        Verwendung        |     GB2 Backend     |    WMS Backend     |        Geolion         |                 Bemerkung                  |
| :-------: | :-----------------: | :----------------------: | :-----------------: | :----------------: | :--------------------: | :----------------------------------------: |
|    DEV    |    dev.geo.zh.ch    |           EBP            |                     |                    |                        | calm-plant-0ecbec603.2.azurestaticapps.net |
|   PROD    |      geo.zh.ch      |        öffentlich        |     maps.zh.ch      |     wms.zh.ch      |     geolion.zh.ch      |                                            |
|   PROD    |     geo.ktzh.ch     |        Verwaltung        |   web.maps.zh.ch    |   web.wms.zh.ch    |    geolion.ktzh.ch     |                                            |
|    UAT    |   uat.geo.ktzh.ch   | Verwaltungsinterne Tests | uatmaps.kt.ktzh.ch  | uatwms.kt.ktzh.ch  | uatgeolion.kt.ktzh.ch  |                                            |
|  STAGING  | staging.geo.ktzh.ch | Produktionsvorbereitung  | testmaps.kt.ktzh.ch | testwms.kt.ktzh.ch | testgeolion.kt.ktzh.ch |                                            |
