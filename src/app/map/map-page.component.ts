import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from '../shared/types/print-type';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';
import {ActiveMapItem} from './models/active-map-item.model';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectActiveMapItems} from '../state/map/reducers/active-map-item.reducer';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService]
})
export class MapPageComponent implements AfterViewInit, OnInit, OnDestroy {
  public readonly onboardingGuideImage = mapOnboardingGuideConfig.introductionImage;
  public mapAttributeFilterItem?: ActiveMapItem;

  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);

  constructor(
    private readonly onboardingGuideService: OnboardingGuideService,
    private readonly mapConfigUrlService: MapConfigUrlService,
    private readonly store: Store
  ) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.onboardingGuideService.autoStart();
  }

  public openMapAttributeFilter(activeMapItem: ActiveMapItem) {
    this.closeMapAttributeFilter();
    this.mapAttributeFilterItem = activeMapItem;
  }

  public closeMapAttributeFilter() {
    this.mapAttributeFilterItem = undefined;
  }

  public showPrint(printType: PrintType) {
    this.mapConfigUrlService.activatePrintMode(printType);
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((activeMapItems) => {
            const isMapAttributeFilterItemActive = activeMapItems.some(
              (activeMapItem) => activeMapItem.id === this.mapAttributeFilterItem?.id
            );
            if (!isMapAttributeFilterItemActive) {
              this.mapAttributeFilterItem = undefined;
            }
          })
        )
        .subscribe()
    );
  }
}
