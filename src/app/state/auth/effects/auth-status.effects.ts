import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {map, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../actions/auth-status.actions';
import {AuthService} from '../../../auth/auth.service';
import {selectCurrentInternalShareLinkItem} from '../../map/selectors/current-share-link-item.selector';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {InternalShareLinkItem} from '../../../shared/interfaces/internal-share-link.interface';

@Injectable()
export class AuthStatusEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly symbolizationToGb3ConverterUtils = inject(SymbolizationToGb3ConverterUtils);

  public login$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthStatusActions.performLogin),
        concatLatestFrom(() => this.store.select(selectCurrentInternalShareLinkItem)),
        map(([_, shareLinkItem]) => this.toShareLinkItem(shareLinkItem)),
        tap((shareLinkItem) => {
          this.sessionStorageService.set('shareLinkItem', this.sessionStorageService.stringifyJson(shareLinkItem));
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
        concatLatestFrom(() => this.store.select(selectCurrentInternalShareLinkItem)),
        map(([{isForced}, shareLinkItem]) => ({isForced, shareLinkItem: this.toShareLinkItem(shareLinkItem)})),
        tap(({isForced, shareLinkItem}) => {
          this.sessionStorageService.set('shareLinkItem', this.sessionStorageService.stringifyJson(shareLinkItem));
          this.authService.logout(isForced);
        }),
      );
    },
    {dispatch: false},
  );

  private toShareLinkItem(shareLinkItem: InternalShareLinkItem) {
    return {
      ...shareLinkItem,
      drawings: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(shareLinkItem.drawings),
      measurements: this.symbolizationToGb3ConverterUtils.convertInternalToExternalRepresentation(shareLinkItem.measurements),
    };
  }
}
