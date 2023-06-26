import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from '../shared/types/print-type';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';
import {LegendActions} from '../state/map/actions/legend.actions';
import {Store} from '@ngrx/store';
import {selectActiveMapItems} from '../state/map/reducers/active-map-item.reducer';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem} from './models/active-map-item.model';
import {selectMapUiState} from '../state/map/reducers/map-ui.reducer';
import {MapUiState} from '../state/map/states/map-ui.state';
import {MapUiActions} from '../state/map/actions/map-ui.actions';
import {MapSideDrawerContent} from '../shared/types/map-side-drawer-content';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService]
})
export class MapPageComponent implements AfterViewInit, OnInit, OnDestroy {
  public readonly onboardingGuideImage = mapOnboardingGuideConfig.introductionImage;
  public activeMapItems: ActiveMapItem[] = [];
  public isMapDataCatalogueMinimized: boolean = false;
  public mapUiState?: MapUiState;
  public mapSideDrawerContent: MapSideDrawerContent = 'none';

  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly onboardingGuideService: OnboardingGuideService,
    private readonly mapConfigUrlService: MapConfigUrlService,
    private readonly store: Store
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
    this.store.dispatch(LegendActions.showLegend());
  }

  public setIsMapDataCatalogueMinimized(isMinimized: boolean) {
    this.isMapDataCatalogueMinimized = isMinimized;
  }

  public openSideDrawer(content: Exclude<MapSideDrawerContent, 'none'>) {
    this.store.dispatch(MapUiActions.setMapSideDrawerContent({mapSideDrawerContent: content}));
  }

  public closeSideDrawer() {
    this.store.dispatch(MapUiActions.setMapSideDrawerContent({mapSideDrawerContent: 'none'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.mapUiState$
        .pipe(
          tap((mapUiState) => {
            this.mapUiState = mapUiState;
            this.mapSideDrawerContent = mapUiState.mapSideDrawerContent;
          })
        )
        .subscribe()
    );
  }
}
