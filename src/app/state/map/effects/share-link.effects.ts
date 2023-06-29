import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ShareLinkActions} from '../actions/share-link.actions';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';
import {Store} from '@ngrx/store';

@Injectable()
export class ShareLinkEffects {
  public dispatchLoadShareLinkItemRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.loadShareLinkItem),
      switchMap((value) =>
        this.shareLinkService.loadShareLink(value.shareLinkId).pipe(
          map((shareLinkItem) => {
            return ShareLinkActions.setShareLinkItem({shareLinkItem});
          }),
          catchError(() => EMPTY) // todo error handling
        )
      )
    );
  });

  public dispatchCreateShareLinkRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.createShareLinkId),
      switchMap((value) =>
        this.shareLinkService.createShareLink(value.shareLinkItem).pipe(
          map((shareLinkId) => {
            return ShareLinkActions.setShareLinkId({shareLinkId});
          }),
          catchError(() => EMPTY) // todo error handling
        )
      )
    );
  });

  constructor(private readonly actions$: Actions, private readonly shareLinkService: Gb3ShareLinkService, private readonly store: Store) {}
}
