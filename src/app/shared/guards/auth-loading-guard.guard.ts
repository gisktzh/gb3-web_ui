import {CanActivateFn} from '@angular/router';
import {Observable} from 'rxjs';
import {inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectIsInitialDataLoaded} from '../../state/auth/reducers/auth-status.reducer';

/**
 * This guard waits for the authentication service to finish loading the current login-state.
 */
export const authLoadingGuard: CanActivateFn = (): Observable<boolean> => {
  return inject(Store).select(selectIsInitialDataLoaded);
};
