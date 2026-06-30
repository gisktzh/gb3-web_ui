import {EnvironmentProviders, Provider} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TIME_SERVICE} from '../app.tokens';
import {timeServiceFactory} from '../shared/factories/time-service.factory';

const testProviders: (Provider | EnvironmentProviders)[] = [
  provideHttpClient(),
  provideHttpClientTesting(),
  {
    provide: TIME_SERVICE,
    useFactory: timeServiceFactory,
  },
];

export default testProviders;
