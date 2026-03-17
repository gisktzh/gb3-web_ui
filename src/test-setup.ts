import esriConfig from '@arcgis/core/config';
esriConfig.assetsPath = '.';

import {getTestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import './app/testing/matchers/drawing-symbol-descriptor.matcher';

const testBed = getTestBed();

if (!testBed.platform) {
  // Initialize the Angular testing environment
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

import './app/testing/mocks/arcgis-core-mapview';
import './app/testing/mocks/arcgis-core-reactive-utils';
import './app/testing/mocks/arcgis-core-webgl-wasm';
import './app/testing/mocks/cim-symbols';
import './app/testing/mocks/globals';
