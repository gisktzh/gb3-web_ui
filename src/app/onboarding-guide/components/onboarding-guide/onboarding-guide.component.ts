import {Component, OnDestroy} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'onboarding-guide',
  templateUrl: './onboarding-guide.component.html',
  styleUrls: ['./onboarding-guide.component.scss'],
})
export class OnboardingGuideComponent implements OnDestroy {
  public progress: number = 0;
  public hasNextStep: boolean = false;
  public hasPreviousStep: boolean = false;
  private readonly numberOfSteps: number = this.tourService.steps.length;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(public readonly tourService: TourService) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.tourService.stepShow$
        .pipe(
          tap(({step}) => {
            const stepIndex = this.tourService.steps.indexOf(step);
            const currentStepNumber = stepIndex + 1;

            this.progress = (currentStepNumber / this.numberOfSteps) * 100;
            this.hasNextStep = this.tourService.hasNext(step);
            this.hasPreviousStep = this.tourService.hasPrev(step);
          }),
        )
        .subscribe(),
    );
  }
}
