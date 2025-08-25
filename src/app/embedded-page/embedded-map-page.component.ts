import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {LoadingState} from '../shared/types/loading-state.type';
import {selectApplicationInitializationLoadingState} from '../state/map/reducers/share-link.reducer';
import {MainPage} from '../shared/enums/main-page.enum';
import {MapContainerComponent} from '../map/components/map-container/map-container.component';
import {LegendOverlayComponent} from '../map/components/legend-overlay/legend-overlay.component';
import {FeatureInfoOverlayComponent} from '../map/components/feature-info-overlay/feature-info-overlay.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ZoomControlsComponent} from '../map/components/map-controls/zoom-controls/zoom-controls.component';

@Component({
  selector: 'embedded-map-page',
  templateUrl: './embedded-map-page.component.html',
  styleUrls: ['./embedded-map-page.component.scss'],
  imports: [
    MapContainerComponent,
    LegendOverlayComponent,
    FeatureInfoOverlayComponent,
    MatButton,
    MatIcon,
    RouterLink,
    ZoomControlsComponent,
  ],
})
export class EmbeddedMapPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  public numberOfQueryLegends: number = 0;
  public id: string | null = null;
  public initializeApplicationLoadingState: LoadingState;
  public isEmbedded: boolean = false;
  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly initializeApplicationLoadingState$ = this.store.select(selectApplicationInitializationLoadingState);

  constructor() {
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
