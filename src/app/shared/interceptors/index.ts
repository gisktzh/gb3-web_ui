import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {UserTokenInterceptor} from './user-token.interceptor';

export const httpInterceptorProviders = [{provide: HTTP_INTERCEPTORS, useClass: UserTokenInterceptor, multi: true}];
