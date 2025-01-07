import {Component, OnDestroy} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from '../../../shared/types/screen-size.type';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';

@Component({
  selector: 'onboarding-guide',
  templateUrl: './onboarding-guide.component.html',
  styleUrls: ['./onboarding-guide.component.scss'],
  standalone: false,
})
export class OnboardingGuideComponent implements OnDestroy {
  public screenMode: ScreenMode = 'regular';
  public progress: number = 0;
  public hasNextStep: boolean = false;
  public hasPreviousStep: boolean = false;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly numberOfSteps: number = this.tourService.steps.length;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    public readonly tourService: TourService,
    private readonly store: Store,
  ) {
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
    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            if (screenMode === 'mobile') {
              this.tourService.end();
            }
          }),
        )
        .subscribe(),
    );
  }
}
