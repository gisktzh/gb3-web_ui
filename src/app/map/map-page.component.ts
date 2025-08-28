import {AfterViewInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ONBOARDING_STEPS, OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
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
import {DisableOverscrollBehaviourComponent} from './components/disable-overscroll-behaviour/disable-overscroll-behaviour.component';
import {MatDrawer, MatDrawerContainer} from '@angular/material/sidenav';
import {NgClass} from '@angular/common';
import {PrintDialogComponent} from './components/map-tools/print-dialog/print-dialog.component';
import {DataDownloadDialogComponent} from './components/map-tools/data-download-dialog/data-download-dialog.component';
import {LegendOverlayComponent} from './components/legend-overlay/legend-overlay.component';
import {MapAttributeFilterOverlayComponent} from './components/map-attribute-filter-overlay/map-attribute-filter-overlay.component';
import {ActiveMapItemsComponent} from './components/active-map-items/active-map-items.component';
import {MapDataCatalogueComponent} from './components/map-data-catalogue/map-data-catalogue.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DataDownloadStatusQueueComponent} from './components/map-tools/data-download-status-queue/data-download-status-queue.component';
import {FeatureInfoOverlayComponent} from './components/feature-info-overlay/feature-info-overlay.component';
import {ElevationProfileOverlayComponent} from './components/elevation-profile-overlay/elevation-profile-overlay.component';
import {DrawingEditOverlayComponent} from './components/drawing-edit-overlay/drawing-edit-overlay.component';
import {SearchWindowComponent} from './components/search-window/search-window.component';
import {MapToolsComponent} from './components/map-tools/map-tools.component';
import {MapControlsComponent} from './components/map-controls/map-controls.component';
import {MapRotationButtonComponent} from './components/map-controls/map-rotation-button/map-rotation-button.component';
import {SearchBarComponent} from '../shared/components/search/search-bar/search-bar.component';
import {BottomSheetOverlayComponent} from './components/bottom-sheet-overlay/bottom-sheet-overlay.component';
import {MapContainerComponent} from './components/map-container/map-container.component';
import {OnboardingGuideComponent} from '../onboarding-guide/components/onboarding-guide/onboarding-guide.component';
import {CenterAnchorComponent} from '../onboarding-guide/components/center-anchor/center-anchor.component';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [
    OnboardingGuideService,
    {provide: ONBOARDING_STEPS, useValue: mapOnboardingGuideConfig},
    provideCharts(withDefaultRegisterables()),
  ],
  imports: [
    DisableOverscrollBehaviourComponent,
    MatDrawerContainer,
    NgClass,
    MatDrawer,
    PrintDialogComponent,
    DataDownloadDialogComponent,
    LegendOverlayComponent,
    MapAttributeFilterOverlayComponent,
    ActiveMapItemsComponent,
    MapDataCatalogueComponent,
    MatButton,
    MatIcon,
    DataDownloadStatusQueueComponent,
    FeatureInfoOverlayComponent,
    ElevationProfileOverlayComponent,
    DrawingEditOverlayComponent,
    SearchWindowComponent,
    MapToolsComponent,
    MapControlsComponent,
    MatIconButton,
    MapRotationButtonComponent,
    SearchBarComponent,
    BottomSheetOverlayComponent,
    MapContainerComponent,
    OnboardingGuideComponent,
    CenterAnchorComponent,
  ],
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
