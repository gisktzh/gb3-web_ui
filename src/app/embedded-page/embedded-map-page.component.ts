import {Component} from '@angular/core';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {Store} from '@ngrx/store';
import {filter, from, Subscription, switchMap, tap} from 'rxjs';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {MapConfigActions} from '../state/map/actions/map-config.actions';
import {ZoomType} from '../shared/types/zoom-type';
import {selectIsMaxZoomedIn, selectIsMaxZoomedOut} from '../state/map/reducers/map-config.reducer';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {ActivatedRoute, Router} from '@angular/router';
import {MainPage} from '../shared/enums/main-page.enum';
import {selectApplicationInitializationLoadingState, selectLoadingState} from '../state/map/reducers/share-link.reducer';
import {LoadingState} from '../shared/types/loading-state';

@Component({
  selector: 'embedded-map-page',
  templateUrl: './embedded-map-page.component.html',
  styleUrls: ['./embedded-map-page.component.scss'],
})
export class EmbeddedMapPageComponent {
  public numberOfQueryLegends: number = 0;
  public isMaxZoomedIn: boolean = false;
  public isMaxZoomedOut: boolean = false;
  public id: string | null = null;
  public loadingState: LoadingState = 'undefined';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly isMaxZoomedIn$ = this.store.select(selectIsMaxZoomedIn);
  private readonly isMaxZoomedOut$ = this.store.select(selectIsMaxZoomedOut);
  private readonly initializeApplicationLoadingState$ = this.store.select(selectApplicationInitializationLoadingState);
  private readonly shareLinkLoadingState$ = this.store.select(selectLoadingState);

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
    this.id = this.route.snapshot.paramMap.get(RouteParamConstants.RESOURCE_IDENTIFIER);
    if (this.id !== null) {
      this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnId({id: this.id}));
    } else {
      // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
      throw new ShareLinkParameterInvalid();
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleLegend() {
    this.store.dispatch(MapUiActions.showLegend());
  }

  public goToInitialExtent() {
    this.store.dispatch(MapConfigActions.resetExtent());
  }

  public handleZoom(zoomType: ZoomType) {
    this.store.dispatch(MapConfigActions.changeZoom({zoomType}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.queryLegends$
        .pipe(
          tap((currentActiveMapItems) => {
            this.numberOfQueryLegends = currentActiveMapItems.length;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.isMaxZoomedIn$.pipe(tap((value) => (this.isMaxZoomedIn = value))).subscribe());
    this.subscriptions.add(this.isMaxZoomedOut$.pipe(tap((value) => (this.isMaxZoomedOut = value))).subscribe());
    this.subscriptions.add(
      this.initializeApplicationLoadingState$
        .pipe(
          tap((loadingState) => (this.loadingState = loadingState)),
          filter((loadingState) => loadingState === 'error'),
          switchMap(() => {
            return from(this.router.navigate([MainPage.Maps]));
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.shareLinkLoadingState$
        .pipe(
          filter((loadingState) => loadingState === 'error'),
          switchMap(() => {
            return from(this.router.navigate([MainPage.Maps]));
          }),
        )
        .subscribe(),
    );
  }
}
