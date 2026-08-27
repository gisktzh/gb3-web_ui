import {Component, computed, inject} from '@angular/core';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {Store} from '@ngrx/store';
import {selectNumberOfQueryLegends} from '../state/map/selectors/query-legends.selector';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {ShareLinkParameterInvalid} from '../shared/errors/share-link.errors';
import {ActivatedRoute, RouterLink} from '@angular/router';
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
export class EmbeddedMapPageComponent {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  public readonly numberOfQueryLegends = this.store.selectSignal(selectNumberOfQueryLegends);
  public readonly id = computed(() => this.route.snapshot.paramMap.get(RouteParamConstants.RESOURCE_IDENTIFIER));
  public readonly initializeApplicationLoadingState = this.store.selectSignal(selectApplicationInitializationLoadingState);

  // compare the window location with its parent location to detect if the page is run within an iframe or not
  public readonly isEmbedded = computed(() => window.location !== window.parent.location);
  protected readonly mainPageEnum = MainPage;

  constructor() {
    const id = this.id();
    if (id !== null) {
      this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnId({id}));
    } else {
      throw new ShareLinkParameterInvalid();
    }
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  }
}
