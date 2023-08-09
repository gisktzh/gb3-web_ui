import {Component} from '@angular/core';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {ActivatedRoute} from '@angular/router';
import {LoadingState} from '../shared/types/loading-state';
import {selectApplicationInitializationLoadingState} from '../state/map/reducers/share-link.reducer';
import {MainPage} from '../shared/enums/main-page.enum';
import {selectLoadingState} from '../state/map/reducers/legend.reducer';

@Component({
  selector: 'embedded-map-page',
  templateUrl: './embedded-map-page.component.html',
  styleUrls: ['./embedded-map-page.component.scss'],
})
export class EmbeddedMapPageComponent {
  public numberOfQueryLegends: number = 0;
  public id: string | null = null;
  public initializeApplicationLoadingState: LoadingState = 'undefined';
  public isEmbedded: boolean = false;
  public showLegendOverlay: boolean = false;
  public readonly MainPageEnum = MainPage;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly initializeApplicationLoadingState$ = this.store.select(selectApplicationInitializationLoadingState);
  private readonly legendLoadingState$ = this.store.select(selectLoadingState);

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute,
  ) {
    // compare the window location with its parent location to detect if the page is run within an iframe or not
    this.isEmbedded = window.location !== window.parent.location;
  }

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
    this.subscriptions.add(
      this.initializeApplicationLoadingState$
        .pipe(tap((loadingState) => (this.initializeApplicationLoadingState = loadingState)))
        .subscribe(),
    );
    this.subscriptions.add(
      this.legendLoadingState$.pipe(tap((loadingState) => (this.showLegendOverlay = loadingState === 'loaded'))).subscribe(),
    );
  }
}
