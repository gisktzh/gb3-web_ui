import {Injectable} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';
import {onboardingGuideSteps} from './onboarding-guide-steps';
import {tap} from 'rxjs';
import {LocalStorageService} from '../../shared/services/local-storage/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuideService {
  constructor(private readonly tourService: TourService, private readonly localStorageService: LocalStorageService) {
    this.tourService.initialize(onboardingGuideSteps, {nextBtnTitle: 'Weiter', prevBtnTitle: 'Zurück', endBtnTitle: 'Beenden'});
    this.initSubscriptions();
  }

  /**
   * Only starts the tour if the onboarding guide is not already viewed/disabled.
   */
  public autoStart() {
    if (!this.localStorageService.exists('onboardingGuideViewed')) {
      this.start();
    }
  }

  public start() {
    this.tourService.start();
  }

  private initSubscriptions() {
    // Set the flag to prevent auto showing the guide when a tour starts; sadly, the ends$ event fires somehow twice and cannot be used
    this.tourService.start$
      .pipe(
        tap(() => {
          this.localStorageService.set('onboardingGuideViewed', 'true');
        })
      )
      .subscribe();
  }
}
