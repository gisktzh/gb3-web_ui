import {AfterViewInit, Component} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from '../shared/types/print-type';
import {ONBOARDING_STEPS, OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService, OnboardingGuideService, {provide: ONBOARDING_STEPS, useValue: mapOnboardingGuideConfig}]
})
export class MapPageComponent implements AfterViewInit {
  public readonly onboardingGuideImage = mapOnboardingGuideConfig.introductionImage;
  constructor(private readonly onboardingGuideService: OnboardingGuideService, private readonly mapConfigUrlService: MapConfigUrlService) {}

  public ngAfterViewInit() {
    this.onboardingGuideService.autoStart();
  }

  public showPrint(printType: PrintType) {
    this.mapConfigUrlService.activatePrintMode(printType);
  }
}
