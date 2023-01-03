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
  urls: ['https://maps.zh.ch', 'http://wms.zh.ch'],
  query: {
    USER_TOKEN: environment.apiKey
  }
});

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
