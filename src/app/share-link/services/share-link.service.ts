import {Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ShareLinkActions} from '../../state/map/actions/share-link.actions';
import {filter, from, Subscription, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectLoadedLayerCatalogueAndShareItem} from '../../state/map/selectors/loaded-layer-catalogue-and-share-item.selector';
import {selectInitializeApplicationLoadingState} from '../../state/map/reducers/share-link.reducer';
import {MainPage} from '../../shared/enums/main-page.enum';

@Injectable({
  providedIn: 'root',
})
export class ShareLinkService implements OnDestroy {
  public id: string | null = null;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadedLayerCatalogueAndShareItem$ = this.store.select(selectLoadedLayerCatalogueAndShareItem);
  private readonly initializeApplicationLoadingState$ = this.store.select(selectInitializeApplicationLoadingState);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly store: Store,
    private readonly router: Router,
  ) {
    this.initSubscriptions();
  }

  public initializeApplication(shareLinkId: string) {
    this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnShareLinkId({id: shareLinkId}));
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.loadedLayerCatalogueAndShareItem$
        .pipe(
          filter((value) => value !== undefined),
          tap((value) => {
            if (value) {
              this.store.dispatch(ShareLinkActions.validateApplicationInitialization({item: value.shareLinkItem, topics: value.topics}));
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.initializeApplicationLoadingState$
        .pipe(
          filter((value) => value === 'loaded'),
          switchMap((value) => {
            return from(this.router.navigate([MainPage.Maps]));
          }),
        )
        .subscribe(),
    );
  }
}
