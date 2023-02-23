import {Injectable} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';
import {onboardingGuideSteps} from './onboarding-guide-steps';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuideService {
  constructor(private readonly tourService: TourService) {
    this.tourService.initialize(onboardingGuideSteps, {nextBtnTitle: 'Weiter', prevBtnTitle: 'Zurück', endBtnTitle: 'Beenden'});
  }

  public start() {
    this.tourService.start();
  }
}
