import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ShareLinkActions} from '../actions/share-link.actions';
import {Gb3ShareLinkService} from '../../../shared/services/apis/gb3/gb3-share-link.service';

@Injectable()
export class ShareLinkEffects {
  public dispatchLoadShareLinkItemRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.loadShareLinkItem),
      switchMap((value) =>
        this.shareLinkService.loadShareLink(value.id).pipe(
          map((item) => {
            return ShareLinkActions.setShareLinkItem({item});
          }),
          catchError(() => EMPTY), // todo  error handling
        ),
      ),
    );
  });

  public dispatchCreateShareLinkRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ShareLinkActions.createShareLinkItem),
      switchMap((value) =>
        this.shareLinkService.createShareLink(value.item).pipe(
          map((id) => {
            return ShareLinkActions.setShareLinkId({id});
          }),
          catchError(() => EMPTY), // todo error handling
        ),
      ),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly shareLinkService: Gb3ShareLinkService,
  ) {}
}
