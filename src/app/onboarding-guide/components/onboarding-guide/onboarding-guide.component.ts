import {Component, computed, inject} from '@angular/core';
import {TourService, TourStepTemplateComponent} from 'ngx-ui-tour-md-menu';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MatCard, MatCardImage, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatCardFooter} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {toSignal} from '@angular/core/rxjs-interop';

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
export class OnboardingGuideComponent {
  protected readonly tourService = inject(TourService);
  private readonly store = inject(Store);
  private readonly currentShownStep = toSignal(this.tourService.stepShow$);
  private readonly currentShownStepIndex = computed(() => {
    const currentShownStep = this.currentShownStep();
    if (!currentShownStep) {
      return 0;
    }

    return this.tourService.steps.indexOf(currentShownStep.step);
  });
  private readonly currentStepNumber = computed(() => this.currentShownStepIndex() + 1);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly progress = computed(() => this.currentStepNumber() + 1);
  public readonly hasNextStep = computed(() => {
    const currentShownStep = this.currentShownStep();
    if (!currentShownStep) {
      return false;
    }

    return this.tourService.hasNext(currentShownStep.step);
  });
  public readonly hasPreviousStep = computed(() => {
    const currentShownStep = this.currentShownStep();
    if (!currentShownStep) {
      return false;
    }

    return this.tourService.hasPrev(currentShownStep.step);
  });
}
