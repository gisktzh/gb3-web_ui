import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

const REGEX_ZH_API = /^https?:\/\/maps.zh.ch\.*/;

@Injectable()
export class UserTokenInterceptor implements HttpInterceptor {
  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiableRequest = request;

    if (REGEX_ZH_API.test(request.url)) {
      modifiableRequest = request.clone({
        params: modifiableRequest.params.set('USER_TOKEN', environment.apiKey)
      });
    }

    return next.handle(modifiableRequest);
  }
}
