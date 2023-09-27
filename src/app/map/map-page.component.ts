import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from './types/print.type';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectMapUiState} from '../state/map/reducers/map-ui.reducer';
import {MapUiState} from '../state/map/states/map-ui.state';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {MapSideDrawerContent} from '../shared/types/map-side-drawer-content.type';
import {selectQueryLegends} from '../state/map/selectors/query-legends.selector';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectLoadingState} from '../state/map/reducers/legend.reducer';
import {LoadingState} from '../shared/types/loading-state.type';
import {ScreenMode} from '../shared/types/screen-size.type';
import {BottomSheetHeight} from '../shared/enums/bottom-sheet-heights.enum';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService],
})
export class MapPageComponent implements AfterViewInit, OnInit, OnDestroy {
  public readonly onboardingGuideImage = mapOnboardingGuideConfig.introductionImage;
  public numberOfQueryLegends: number = 0;
  public isMapDataCatalogueMinimized: boolean = false;
  public mapUiState?: MapUiState;
  public loadingState?: LoadingState;
  public mapSideDrawerContent: MapSideDrawerContent = 'none';
  public screenMode: ScreenMode = 'mobile';

  private readonly queryLegends$ = this.store.select(selectQueryLegends);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly laodingState$ = this.store.select(selectLoadingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly onboardingGuideService: OnboardingGuideService,
    private readonly mapConfigUrlService: MapConfigUrlService,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.onboardingGuideService.autoStart();
  }

  public showPrint(printType: PrintType) {
    this.mapConfigUrlService.activatePrintMode(printType);
  }

  public toggleLegend() {
    if (this.loadingState === 'loaded') {
      this.store.dispatch(MapUiActions.hideLegend());
    } else {
      this.store.dispatch(MapUiActions.showLegend());
    }
  }

  public toggleSelection() {
    this.store.dispatch(MapUiActions.showBasemapSelectorMobile());
    this.store.dispatch(MapUiActions.setBottomSheetHeight({bottomSheetHeight: BottomSheetHeight.small}));
  }

  public setIsMapDataCatalogueMinimized(isMinimized: boolean) {
    this.isMapDataCatalogueMinimized = isMinimized;
  }

  public closeSideDrawer() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
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
      this.mapUiState$
        .pipe(
          tap((mapUiState) => {
            this.mapUiState = mapUiState;
            this.mapSideDrawerContent = mapUiState.mapSideDrawerContent;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.laodingState$
        .pipe(
          tap((loadingState) => {
            this.loadingState = loadingState;
          }),
        )
        .subscribe(),
    );
  }
}
