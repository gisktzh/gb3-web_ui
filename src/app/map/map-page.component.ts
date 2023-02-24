import {AfterViewInit, Component} from '@angular/core';
import {MapConfigUrlService} from './services/map-config-url.service';
import {PrintType} from '../shared/types/print-type';
import {OnboardingGuideService} from './onboarding-guide/onboarding-guide.service';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  providers: [MapConfigUrlService]
})
export class MapPageComponent implements AfterViewInit {
  constructor(private readonly onboardingGuideService: OnboardingGuideService, private readonly mapConfigUrlService: MapConfigUrlService) {}

  public ngAfterViewInit() {
    this.onboardingGuideService.autoStart();
  }

  public showPrint(printType: PrintType) {
    this.mapConfigUrlService.activatePrintMode(printType);
  }
}
