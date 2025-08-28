import {Component, OnDestroy, inject} from '@angular/core';
import {TourService, TourStepTemplateComponent} from 'ngx-ui-tour-md-menu';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from '../../../shared/types/screen-size.type';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MatCard, MatCardImage, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatCardFooter} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'onboarding-guide',
  templateUrl: './onboarding-guide.component.html',
  styleUrls: ['./onboarding-guide.component.scss'],
  imports: [
    TourStepTemplateComponent,
    MatCard,
    MatCardImage,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatButton,
    MatIcon,
    MatCardFooter,
    MatProgressBar,
  ],
})
export class OnboardingGuideComponent implements OnDestroy {
  protected readonly tourService = inject(TourService);
  private readonly store = inject(Store);

  public screenMode: ScreenMode = 'regular';
  public progress: number = 0;
  public hasNextStep: boolean = false;
  public hasPreviousStep: boolean = false;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly numberOfSteps: number = this.tourService.steps.length;
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
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
