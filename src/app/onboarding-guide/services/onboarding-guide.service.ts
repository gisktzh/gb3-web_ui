import {Inject, Injectable, InjectionToken} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';
import {tap} from 'rxjs';
import {LocalStorageService} from '../../shared/services/local-storage.service';
import {OnboardingGuideConfig} from '../interfaces/onboarding-guide-config.interface';

export const ONBOARDING_STEPS = new InjectionToken<string>('onboardingSteps');

@Injectable()
export class OnboardingGuideService {
  private readonly onboardingGuideId: string;

  constructor(
    private readonly tourService: TourService,
    private readonly localStorageService: LocalStorageService,
    @Inject(ONBOARDING_STEPS) private readonly onboardingGuideConfig: OnboardingGuideConfig,
  ) {
    const {id, steps} = this.onboardingGuideConfig;
    this.tourService.initialize(steps, {nextBtnTitle: 'Weiter', prevBtnTitle: 'Zurück', endBtnTitle: 'Beenden'});
    this.onboardingGuideId = id;
    this.initSubscriptions();
  }

  /**
   * Only starts the tour if the onboarding guide is not already viewed/disabled.
   */
  public autoStart() {
    if (!this.isGuideAlreadyViewed()) {
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
          this.markGuideAsViewed();
        }),
      )
      .subscribe();
  }

  private markGuideAsViewed() {
    const viewedGuides = this.getViewedGuides();

    if (!viewedGuides.includes(this.onboardingGuideId)) {
      viewedGuides.push(this.onboardingGuideId);

      this.localStorageService.set('onboardingGuidesViewed', JSON.stringify(viewedGuides));
    }
  }

  private isGuideAlreadyViewed(): boolean {
    const viewedGuides = this.getViewedGuides();

    return viewedGuides.includes(this.onboardingGuideId);
  }

  private getViewedGuides(): string[] {
    const viewedGuides = this.localStorageService.get('onboardingGuidesViewed');
    if (viewedGuides === null) {
      return [];
    }

    try {
      const parsedArray = JSON.parse(viewedGuides);
      if (parsedArray === undefined || !Array.isArray(parsedArray)) {
        return [];
      }
      return parsedArray;
    } catch (e) {
      return [];
    }
  }
}
