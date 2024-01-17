import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {ActivatedRoute} from '@angular/router';
import {LoadingState} from '../shared/types/loading-state.type';
import {selectApplicationInitializationLoadingState} from '../state/map/reducers/share-link.reducer';
import {MainPage} from '../shared/enums/main-page.enum';

@Component({
  selector: 'embedded-map-page',
  templateUrl: './embedded-map-page.component.html',
  styleUrls: ['./embedded-map-page.component.scss'],
})
export class EmbeddedMapPageComponent implements OnInit, OnDestroy {
  public numberOfQueryLegends: number = 0;
  public id: string | null = null;
  public initializeApplicationLoadingState: LoadingState;
  public isEmbedded: boolean = false;
  protected readonly MainPageEnum = MainPage;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly initializeApplicationLoadingState$ = this.store.select(selectApplicationInitializationLoadingState);

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
      throw new ShareLinkParameterInvalid();
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
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
  }
}
