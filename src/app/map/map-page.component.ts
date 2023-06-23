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
import {selectPrintDialogVisible} from '../state/map/reducers/print.reducer';
import {MapElementsVisibility} from '../shared/types/map-elements-visibility';

type SideDrawerContent = 'none' | 'print';

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
  public currentSideDrawerContent: SideDrawerContent = 'none';
  public mapElementsVisibility: MapElementsVisibility = 'visible';

  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly printDialogVisible$ = this.store.select(selectPrintDialogVisible);
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
      this.printDialogVisible$
        .pipe(
          tap((printDialogVisible) => {
            if (printDialogVisible) {
              this.currentSideDrawerContent = 'print';
              this.mapElementsVisibility = 'hidden';
            } else if (this.currentSideDrawerContent === 'print') {
              this.currentSideDrawerContent = 'none';
              this.mapElementsVisibility = 'visible';
            }
          })
        )
        .subscribe()
    );
  }

  private updateToolVisibility() {

  }
}
