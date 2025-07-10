import {AfterViewInit, Component, OnDestroy, OnInit, inject} from '@angular/core';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {Store} from '@ngrx/store';
import {delayWhen, interval, Subscription, tap} from 'rxjs';
import {selectMapUiState} from '../state/map/reducers/map-ui.reducer';
import {MapUiState} from '../state/map/states/map-ui.state';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {MapSideDrawerContent} from '../shared/types/map-side-drawer-content.type';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../shared/types/screen-size.type';
import {initialState as initialMapConfigState, selectMapConfigState, selectRotation} from '../state/map/reducers/map-config.reducer';
import {selectDevMode} from '../state/app/reducers/app.reducer';
import {InitialMapExtentService} from './services/initial-map-extent.service';
import {MapConfigState} from '../state/map/states/map-config.state';
import {MapConfigActions} from '../state/map/actions/map-config.actions';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  standalone: false,
})
export class MapPageComponent implements AfterViewInit, OnInit, OnDestroy {
  private readonly onboardingGuideService = inject(OnboardingGuideService);
  private readonly initialMapExtentService = inject(InitialMapExtentService);
  private readonly store = inject(Store);

  public numberOfQueryLegends: number = 0;
  public isMapDataCatalogueMinimized: boolean = false;
  public mapUiState?: MapUiState;
  public mapSideDrawerContent: MapSideDrawerContent = 'none';
  public screenMode: ScreenMode = 'mobile';
  public mapConfigState: MapConfigState = initialMapConfigState;
  public rotation: number = 0;
  public isDevModeActive: boolean = false;

  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly rotation$ = this.store.select(selectRotation);
  private readonly devMode$ = this.store.select(selectDevMode);
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
    if (!this.mapConfigState.predefinedInitialExtent) {
      const {x, y, scale} = this.initialMapExtentService.calculateInitialExtent();
      this.store.dispatch(
        MapConfigActions.setInitialMapConfig({
          x,
          y,
          scale,
          basemapId: this.mapConfigState.activeBasemapId,
          initialMaps: [],
        }),
      );
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    if (this.screenMode !== 'mobile') {
      this.onboardingGuideService.autoStart();
    }
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  }

  public showMapManagement() {
    this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'map-management'}));
  }

  public setIsMapDataCatalogueMinimized(isMinimized: boolean) {
    this.isMapDataCatalogueMinimized = isMinimized;
  }

  public closeSideDrawer() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.rotation$
        .pipe(
          delayWhen((rotation) => (rotation === 0 ? interval(2000) : interval(0))),
          tap((rotation) => (this.rotation = rotation)),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.queryLegends$.pipe(tap((currentActiveMapItems) => (this.numberOfQueryLegends = currentActiveMapItems.length))).subscribe(),
    );

    this.subscriptions.add(
      this.mapUiState$
        .pipe(
          tap((mapUiState) => {
            this.mapUiState = mapUiState;
            this.mapSideDrawerContent = mapUiState.mapSideDrawerContent;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.devMode$.pipe(tap((devMode) => (this.isDevModeActive = devMode))).subscribe());
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  public mapSideDrawerFullyOpened() {
    this.store.dispatch(MapUiActions.notifyMapSideDrawerAfterOpen());
  }
}
