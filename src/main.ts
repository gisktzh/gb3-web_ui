import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import esriConfig from '@arcgis/core/config';

if (environment.production) {
  enableProdMode();
}

/**
 * Required configuration to append user_token to each request. This is used as a workaround only because we're
 * currently required to use the api key to access GB2 backend.
 */
esriConfig.request.interceptors?.push({
  urls: ['https://maps.zh.ch', 'https://wms.zh.ch'],
  query: {
    USER_TOKEN: environment.apiKey
  }
});

/**
 * Because the GetCapabalities response often sends a non-secure http://wms.zh.ch response, Esri Javascript API fails on https environments
 * to attach the token above if the urls is set to http://wms.zh.ch; because it automatically upgrades insecure links to https to avoid
 * mixed-content.
 *
 * In order for it to still work on localhost, the above interceptor only listens to https, and the following setting tells our Esri map
 * that requests to wms.zh.ch are always okay to be upgraded to https - even in localhost environments.
 */
esriConfig.request.httpsDomains?.push('wms.zh.ch');

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
