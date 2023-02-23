import {Component} from '@angular/core';
import {TourService} from 'ngx-ui-tour-md-menu';

@Component({
  selector: 'onboarding-guide',
  templateUrl: './onboarding-guide.component.html',
  styleUrls: ['./onboarding-guide.component.scss']
})
export class OnboardingGuideComponent {
  constructor(public readonly tourService: TourService) {}
}
