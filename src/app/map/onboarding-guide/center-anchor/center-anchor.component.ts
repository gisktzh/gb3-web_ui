import {Component, Input} from '@angular/core';
import {OnboardingGuideAnchor} from '../onboarding-guide-steps';

@Component({
  selector: 'center-anchor',
  templateUrl: './center-anchor.component.html',
  styleUrls: ['./center-anchor.component.scss']
})
export class CenterAnchorComponent {
  @Input() public anchorName!: OnboardingGuideAnchor;
}
