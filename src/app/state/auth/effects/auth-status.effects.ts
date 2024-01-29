import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthService} from '../../../auth/auth.service';

@Injectable()
export class AuthStatusEffects {
  public login$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogin),
        tap(() => {
          this.authService.login();
        }),
      );
    },
    {dispatch: false},
  );

  public logout$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogout),
        tap(({isForced}) => {
          this.authService.logout(isForced);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly authService: AuthService,
  ) {}
}
