# Gb3Poc

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Local setup

1. Copy `./src/environments/environment.local.ts.example` to `./src/environments/environment.local.ts` and configure the GB3 API key. This is currently needed in order to access the GB3 API services.

## Building the image

In order to build the docker image, the `GB2_API_USER_TOKEN` is required and has to be passed as build argument, like so

```
docker build -t gb3-frontend:latest --build-arg GB2_API_USER_TOKEN=this_is_the_token .
```
