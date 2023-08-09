import {CanActivateFn} from '@angular/router';
import {filter, Observable} from 'rxjs';
import {inject} from '@angular/core';
import {AuthService} from '../../auth/auth.service';

/**
 * This guard waits for the authentication service to finish loading the current login-state.
 */
export const AuthLoadingGuard: CanActivateFn = (route, state): Observable<boolean> => {
  return inject(AuthService).isDoneLoading$.pipe(filter((isDoneLoading) => isDoneLoading));
};
