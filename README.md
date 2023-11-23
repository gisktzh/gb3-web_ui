# GB3 Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

> # Table of Contents
>
> 1. [Node version](#node-version)
> 2. [Development server](#development-server)
> 3. [Docker](#docker)
> 4. [Local Backend](#local-backend)
> 5. [Naming conventions](#naming-conventions)
> 6. [Code documentation](#code-documentation)
> 7. [Git conventions](#git-conventions)

## Node version

We strive to use the most recent LTS version. Whenever an update is due, make sure you adjust the following:

- `Dockerfile`
- `.azure-pipelines/templates/variables.yaml` (**Warning!** There are cases where the pipeline does not yet have the
  newest node version; in that case, leave it as before and ignore the pipeline warnings)
- `.nvmrc`
- `package.json`, update the `@typed/node` package to the matching version; run `npm install` afterwards to freshly generate the `package-lock.json`
- `renovate.json` update both `"matchManagers": ["dockerfile"]` and `"matchManagers": ["npm"]` to the matching version

You should point it towards the latest minor update (e.g. 20.x), such that we can control potentially larger updates.

If you're using [nvm](https://github.com/nvm-sh/nvm) on a Unix-based environment, you can conveniently use `nvm use` in
the root directory and it will automatically set the node version to the correct one.

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

Before the **first start** create volume for log files. It has to be done only **once**

```
docker volume create nginx-logs
```

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
- **APP_VERSION**: see below (optional)
- **APP_RELEASE**: see below (optional)

The `target_environment` is used to create environment specific build outputs so as to not divulge sensitive information
such as internal domains. This is mainly reflected in the runtime configuration mechanism described below.

#### Overriding app version and release number

During build, the Dockerfile will run `npm run update-version`. Per default, it tries to extract the last git commit
hash as app version number and the last tag as release number. This _only_ works if the build command is run within the
context of a repository-checkout; if it fails, it will display `UNKNOWN_VERSION`.

If you're building the image outside of a repository context (i.e. within a pipeline), you can specify the version and
release number explicitly using the following build-args:

- `APP_VERSION`: The version number, usually the last git commit hash in `--short` form
- `APP_RELEASE`: The release number, usually in the form of "Release-xx"

An example command would look like this:

```
docker build --no-cache --build-arg APP_VERSION=MyCustomAppVersion --build-arg APP_RELEASE=MyCustomRelease -t gb3-frontend:latest .
```

Irrespective of how the versions are extracted, they overwrite the `/src/version.ts` file, which is in turn exposed via
Angular's environment configs.

### Run the image

This image exposes port 8080 and can be run like this:

```
docker run -p 80:8080 -v nginx-logs:/var/log/nginx  --name gb3-frontend gb3-frontend:latest
```

- **80:8080** maps the internal port 8080 to the external port 80; the later can be chosen freely
- **gb3-frontend** is the name of the image
- **latest** is the version tag for this image
- **-v nginxlogs:/var/log/nginx** volume folder with log files for filebeat

## Local Backend

### Using local GB2 setup

If you're using a local GB2 setup (e.g. via docker), you can use this backend by
running `ng serve --configuration=development-local-gb2` (or `npm run start-local-gb2` shorthand). This assumes that

- GB2 runs on localhost, port 3000, exposing **all** services from GB2 (wms, tokens, etc.)
- GB2 is accessible from your host

If using this, angular will proxy all requests to the GB2 via localhost, so you have to set all links to be relative (
e.g. `/wms/asd` will become `http://localhost:4200/wms/asd`, and then proxied to `http://localhost:3000/wms/asd`).

## Naming conventions

Generally, we are orientating ourselves at the default Typescript naming conventions.

WIP - add more naming conventions :)

### Branchname and commit message

Whenever possible, a Jira ticket should be referenced in both branchname and commit message:

- Branches: `[feature|hotfix]/gb3-[xxx]-[name-of-branch]`, where `xxx` refers to a Jira ticket and the `name-of-branch`
  is a short summary of the feature/hotfix.`
- Commits: `GB3-[xxx]: Your commit message`, , where `xxx` refers to a Jira ticket

Our githooks check for both the branch name and the commit message, but they will only output a warning if they don't
match. This is because there are times when you _might_ want to deviate from these rules.

## Code documentation

> 1. [The `ActiveMapItem` class](#the-activemapitem-class)
> 2. [Spatial Reference System(s)](#spatial-reference-systems)
> 3. [State](#state)
> 4. [Runtime configurations](#runtime-configurations)
> 5. [(S)CSS structure](#scss-structure)
> 6. [Custom icons](#custom-icons)
> 7. [Transformation from GB2 backend API to GB3 interfaces](#transformation-from-gb2-backend-api-to-gb3-interfaces)
> 8. [Error handling](#error-handling)
> 9. [Application Initialization based on share link](#application-initialization-based-on-share-link)
> 10. [Adding new NPM packages](#adding-new-npm-packages)

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
the `ActiveMapItem` has a property `settings` which is a discriminated union type `ActiveMapItemSettings`,
holding all layer settings. This allows for a flexible combination of `ActiveMapItem`s and their settings.

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
  }),
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

### (S)CSS structure

#### BEM - structured CSS

We are using BEM to structure our (S)CSS: https://getbem.com/introduction/

Basically there are three important elements to keep track of:

- **blocks** \
  Standalone entity that is meaningful on its own. \
  Example: `active-map-item-header` \
  How to use: `active-map-item-header` (no change)
- **Element** \
  A part of a block that has no standalone meaning and is semantically tied to its block. \
  Example: `header-title` \
  How to use: `active-map-item-header__title` (connect to a _block_ using two underscores)
- **Modifier** \
  A flag on a block or element. Use them to change appearance or behavior. \
  Example: `disabled` \
  How to use: `active-map-item-header--disabled` (connect to a _block_ or _element_ using two dashes)

#### Global functions / variables / mixins / overrides

Each component is responsible for its own styling. However, to prevent too much code duplications we have some global
helper files in our `\styles` folder:

- **functions/...** contains some helper functions to calculate e.g. the RGBA value of a hex value.
- **mixins/...** contains mixin files divided into categories used to style specific sections of the application. These
  are the styles that can be shared between different components.
- **overrides/...** contains a couple of style files used to globally override certain elements. Use with caution.
- **variables/\_ktzh-design-variables.scss** contains all important variables used within the GB3 application. Most
  notable the color palettes that are used everywhere. Try to avoid hard-coded color values inside some local SCSS file.
- **variables/\_z-index-variables.scss** contains all z-indices ordered by the highest value first. This is used to keep
  track of which element should be on top of which element in one place.

To use those global styles within a local SCSS file use the following syntax (or part of it):

```SCSS
@use 'functions/helper.function' as functions;
@use 'mixins/helpers.mixin' as mixins;
@use 'mixins/material.mixin' as mat-mixins;
@use 'variables/ktzh-design-variables' as ktzh-variables;
@use 'variables/z-index-variables' as z-index-variables;
```

Example of a potential usage:

```SCSS
.button {
  background-color: functions.get-color-from-palette(ktzh-variables.$zh-secondary-accent);
}
```

### Custom icons

All custom icons are handled via the `IconsService` and the `iconsConfig`. Add the identifier and the path to the URL (
relative or absolute) and the service adds the icons. Use them as follows:

```angular2html

<mat-icon svgIcon="icon_id_from_config"></mat-icon>
```

In order to have the SVG adjust itself to the color (e.g. disabled state), replace all `fill="color"` occurrences in the
SVG which should be assigned the font color with `fill="currentColor"`. In some cases, the color might also be
within `stroke` or other attributes.

### Transformation from GB2 backend API to GB3 interfaces

To separate the GB2 API interfaces from the internal ones we use transformation methods inside the corresponding
GB3-services. Usually it's used to adjust some minor issues like naming (`gb2_url` => `gb2Url`).
There are a few exceptions where more logic is used to transform values:

#### Topics endpoint

There are many mayor changes during the transformation of the `topics.json` from the GB2 API.
First of all the naming is different:

| GB2 API interface name | GB3 interface name |      Example      |
| :--------------------: | :----------------: | :---------------: |
|        category        |       topic        | _Luft und Klima_  |
|         topic          |        map         | _Lichtemissionen_ |
|         layer          |       layer        |   _August 2018_   |

Another noticeable change is the order of layers. WMS 1.3 describes the order as follows:

> A WMS shall render the requested layers by drawing the leftmost in the list bottommost,
> the next one over that, and so on.

Meaning that the layer with the lowest index has the lowest visibility. However, in GB3 the order is inverted
to that as the item with the lowest index has the highest visibility. Therefore, the order of the GB2 API layers
get inverted to tackle that problem.

### Error handling

The global error handler is located in the `error-handling` module. All errors are caught by Angular and delegated to
this handler which then handles the errors according to their type. Additionally, while in develop mode, the errors are
logged to the console.

The application itself defines errors that extend the native `Error` object, which allows for easier
handling and runtime error checks. These abstract errors are defined within `app/shared/errors/abstract.errors.ts`. The
abstract base class of all custom errors is `Gb3RuntimeError`. It defines an (optional) property `originalError`
of `unknown` type which can be used to wrap any caught error. The error handler will then check whether this property is
set and log the original message as well.

All errors should extend from the following abstract classes, extending `Gb3RuntimeError`. They have different behaviour
in the error handler:

- `FatalError`: This error will raise an error that prevents the current screen from being used by redirecting to our
  fatal error page.
- `RecoverableError`: This error will pop an error notification, but will not prevent the app from being used.
- `SilentError`: This error will do nothing, except (in dev mode) log itself to the console. Useful for errors that
  should not be communicated to the user.

Of course, all other errors that might be thrown in the code and that are not caught (e.g.
simple `throw new Error('Fail!')`) will be handled as well; and currently, they are treated as `FatalError` because we
cannot reliably determin whether an error is critical or not.

#### Implementing custom error classes

Implementing a custom error class is as simple as extending from one of the mentioned base classes. In most cases, you
should add a `public override message: string = 'Your Error Message'` to the class, and you can, of course, add custom
logic.

If no `constructor` is specified, the constructor of `Gb3RuntimeError` is taken that can be supplied (optionally) with
the actually thrown error.

#### Handling errors

In general, throwing an error is straight-forward: Just `throw` it.

In practice, there are situations where this is not as simple: In situations where we have an API call within an effect
and also use a `loadingState`, we cannot directly use `catchError` in the service API call's pipe chain, because this
would only show the error message without updating the loading state. For these cases, you should add a
dedicated `setError` action which sets the loading state through the reducer, and then have another effect that listens
to this action and then raises the appropriate error. In order to also have the originally thrown error, the
helper `errorProps()` can be used as `ActionProp` so you can pass along the original error for usage within the effect.
For examples of this, see e.g. the `LegendEffect`.

**Importantly**, if you throw exceptions within the `constructor` of a service, make sure to inject the `ErrorHandler`
interface and throw it explicitly using the `handleError` method. Otherwise, depending on the order of Angular's DI, the
error handler might not yet be registered and throw the exception outside of the Angular error handler.

### Application Initialization based on share link

Loading and initializing of the application based on a previously shared link ID is completely done within
the `share-link.state`.
There is the whole `initializeApplication` and `validation` part where the application gets initialized.
This part is basically a big state machine used to control the initialization flow. It's taking care of all potential
side effects like
invalid share link item contents or topics that are not getting loaded.

The basic flow based on actions and effects goes like this:

```
                                     ┌─────────────────────────────────────────────────┐
                                     │ ShareLinkActions.initializeApplicationBasedOnId │
                                     └───────┬─────────────┬─────────────────┬─────────┘
initializeApplicationByLoadingShareLinkItem$ │             │                 │ initializeApplicationByLoadingTopics$
                             ┌───────────────▼───────────┐ │ ┌───────────────▼──────────────────────┐
                             │ ShareLinkActions.loadItem │ │ │ LayerCatalogActions.loadLayerCatalog │
                             └───────────────┬───────────┘ │ └───────────────┬──────────────────────┘
                                             └───────────► │◄────────────────┘
               initializeApplicationByVerifyingSharedItem$ │
                                          ┌────────────────▼──────────────┐
                                          │ ShareLinkActions.validateItem │
                                          └────────────────┬──────────────┘
                                    validateShareLinkItem$ │
                                       ┌───────────────────▼─────────────────┐
                                       │ ShareLinkActions.completeValidation │
                                       └──────┬────────────┬──────────┬──────┘
                 setMapConfigAfterValidation$ │            │          │ setActiveMapItemsAfterValidation$
                  ┌───────────────────────────▼──────────┐ │ ┌────────▼──────────────────────────────────────┐
                  │ MapConfigActions.setInitialMapConfig │ │ │ ActiveMapItemActions.initializeActiveMapItems │
                  └──────────────────────────────────────┘ │ └────────┬──────────────────────────────────────┘
                                                           │ ◄────────┘
                                   completeInitialization$ │
                                 ┌─────────────────────────▼──────────────────────────┐
                                 │ ShareLinkActions.completeApplicationInitialization │
                                 └────────────────────────────────────────────────────┘
```

Note that error actions/effects are not visible on this diagram

### Adding new NPM packages

Usually there are two ways to add new NPM packages. Either calling

- `npm install <package> --save` \
  To install the package and add it to the `package.json` (and `package-lock.json`) in the section **dependencies**.
- `npm install <package> --save-dev` \
  To install the package and add it to the `package.json` (and `package-lock.json`) in the section **devDependencies**.

The later (`devDependencies`) is usually reserved for all dependencies that are not necessary to run the code in a productive environment (e.g. a unit test framework like `Jasmine`). And usually also stuff like `@angular/compiler` or `@types/...`.
However, this code gets build inside a docker container using the command `npm ci --ignore-scripts --omit=dev`. `--omit=dev` ignores all packages in the **devDependencies** section. Afterward, a build is triggered. This build of course needs build tools like `@angular/compiler` which are not available if they're not located inside the **dependencies** section.

This has the consequence that a lot of packages are located within the **dependencies** section that would usually be in the **devDepencies** section.

To test if a new package has to be added to the **dependencies** or the **devDependencies** section it's easy to test by running the following commands:

```shell
npm ci --ignore-scripts --omit=dev
npm run build-production
```

## Git conventions

### Branching strategy

Our repository is mainly using the standard [Git flow branching model](https://nvie.com/posts/a-successful-git-branching-model/).

<img src="https://nvie.com/img/git-model@2x.png" alt="Git flow branching model" width="400"/>

There are the following branches:

- **main** \
  The production branch. Every commit has to be stable and tested as it is used as released code. Therefore, every commit that was released is marked by a tag `release-XXX` where `XXX` is the release number. It's entirely possible to have multiple release tags on the same commit if this repository wasn't updated since the last releases.
- **develop** \
  The main development branch. Every commit has to be stable as it will be deployed automatically to the [dev-environment server](https://dev.geo.zh.ch/).
- **feature/\*** , **bugfix/\*** \
  Individual feature/bugfix branches. They don't have to be stable as they are connected to one person working on it. They are based on the develop branch and finally get merged into that branch again. \
  ℹ See also naming conventions for branch naming and commit message format: [Branchname and commit message](#branchname-and-commit-message)
- **hotfix/\*** \
  This is reserved to fix bugs that occur in a productive environment and need to be fixed ASAP. They're based on the main branch (and not the develop) because it is entirely possible that there are already new features on the develop branch that should not be released. As soon as this branch is finished it needs to be merged back to main (via PR). After that it's very important to create a second PR to merge this branch into the develop branch as well.

### Naming conventions

> **See [Branchname and commit message](#branchname-and-commit-message)**
