import {afterRenderEffect, effect, untracked, Component, computed, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {ONBOARDING_STEPS, OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {Store} from '@ngrx/store';
import {selectMapUiState} from '../state/map/reducers/map-ui.reducer';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {selectNumberOfQueryLegends} from '../state/map/selectors/query-legends.selector';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectMapConfigState, selectRotation} from '../state/map/reducers/map-config.reducer';
import {InitialMapExtentService} from './services/initial-map-extent.service';
import {MapConfigActions} from '../state/map/actions/map-config.actions';
import {DisableOverscrollBehaviourComponent} from './components/disable-overscroll-behaviour/disable-overscroll-behaviour.component';
import {MatDrawer, MatDrawerContainer} from '@angular/material/sidenav';
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
import {NgTemplateOutlet} from '@angular/common';
import {SessionStorageService} from '../shared/services/session-storage.service';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {
  selectApplicationInitializationLoadingState,
  selectLoadingState as selectShareLinkLoadingState,
} from '../state/map/reducers/share-link.reducer';
import {WaitingPageComponent} from '../shared/components/waiting-page/waiting-page.component';
import {MainPage} from '../shared/enums/main-page.enum';

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
    WaitingPageComponent,
    DisableOverscrollBehaviourComponent,
    MatDrawerContainer,
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
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '(window:keydown.esc)': 'closeSideDrawer()',
  },
})
export class MapPageComponent implements OnInit {
  private readonly onboardingGuideService = inject(OnboardingGuideService);
  private readonly initialMapExtentService = inject(InitialMapExtentService);
  private readonly store = inject(Store);
  private readonly sessionStorageService = inject(SessionStorageService);

  public readonly isRestoringShareLink = signal(false);
  protected readonly mainPage = MainPage;
  private readonly initializationState = this.store.selectSignal(selectApplicationInitializationLoadingState);
  private readonly shareLinkLoadingState = this.store.selectSignal(selectShareLinkLoadingState);

  public readonly numberOfQueryLegends = this.store.selectSignal(selectNumberOfQueryLegends);
  public readonly isMapDataCatalogueMinimized = signal(false);
  public readonly mapUiState = this.store.selectSignal(selectMapUiState);
  public readonly mapSideDrawerContent = computed(() => this.mapUiState().mapSideDrawerContent || 'none');
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly mapConfigState = this.store.selectSignal(selectMapConfigState);
  public readonly rotation = this.store.selectSignal(selectRotation);
  public readonly sideBarWidth = computed(() => this.mapUiState().sideBarWidth);
  public readonly isSideBarOverlayVisible = computed(() => {
    const mapUiState = this.mapUiState();
    return mapUiState.isFeatureInfoOverlayVisible || mapUiState.isElevationProfileOverlayVisible || mapUiState.isDrawingEditOverlayVisible;
  });

  constructor() {
    // Wait for share-link restoration before creating the map; use the default extent on failure.
    effect(() => {
      if (!this.isRestoringShareLink()) {
        return;
      }
      const state = this.initializationState();
      const failed = state === 'error' || this.shareLinkLoadingState() === 'error';
      if (state === 'loaded' || failed) {
        if (failed) {
          untracked(() => this.initializeDefaultExtent());
        }
        this.isRestoringShareLink.set(false);
      }
    });
    // Start desktop onboarding only after the restored or default map UI has rendered.
    afterRenderEffect(() => {
      if (!this.isRestoringShareLink() && this.screenMode() !== 'mobile') {
        untracked(() => this.onboardingGuideService.autoStart());
      }
    });
  }

  public ngOnInit() {
    const pendingShareLinkId = this.sessionStorageService.get(RouteParamConstants.SHARE_LINK_ID_SESSION_STORAGE_KEY);
    this.sessionStorageService.remove(RouteParamConstants.SHARE_LINK_ID_SESSION_STORAGE_KEY);
    if (pendingShareLinkId) {
      this.isRestoringShareLink.set(true);
      this.store.dispatch(ShareLinkActions.initializeApplicationBasedOnId({id: pendingShareLinkId}));
      return;
    }

    this.initializeDefaultExtent();
  }

  private initializeDefaultExtent() {
    if (!this.mapConfigState().predefinedInitialExtent) {
      const {x, y, scale} = this.initialMapExtentService.calculateInitialExtent();
      this.store.dispatch(
        MapConfigActions.setInitialMapConfig({
          x,
          y,
          scale,
          basemapId: this.mapConfigState().activeBasemapId,
          initialMaps: [],
        }),
      );
    }
  }

  public showLegend() {
    this.store.dispatch(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
  }

  public showMapManagement() {
    this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'map-management'}));
  }

  public setIsMapDataCatalogueMinimized(isMinimized: boolean) {
    this.isMapDataCatalogueMinimized.set(isMinimized);
  }

  public setSideBarWidth(width: number) {
    this.store.dispatch(MapUiActions.setSideBarWidth({width}));
  }

  public closeSideDrawer() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  public mapSideDrawerFullyOpened() {
    this.store.dispatch(MapUiActions.notifyMapSideDrawerAfterOpen());
  }
}
