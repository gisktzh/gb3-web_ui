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

In order to build the docker image use the following command (adjust tag as needed):

```
docker build -t gb3-frontend:latest .
```

- **gb3-frontend** is the name of the image
- **latest** is the tag used to mark the version of this image

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
