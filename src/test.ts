// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import esriConfig from '@arcgis/core/config';
esriConfig.assetsPath = '.';

import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {timeServiceFactory} from './app/shared/factories/time-service.factory';
import {TIME_SERVICE} from './app/app.tokens';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting([
    // we provide the time service here so it is the same as in the running app and we don't have to inject it in each test
    {
      provide: TIME_SERVICE,
      useFactory: timeServiceFactory,
    },
  ]),
);
