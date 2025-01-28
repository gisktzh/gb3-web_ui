import {Component, Input} from '@angular/core';
import {OnboardingGuideAnchor} from '../../types/onboarding-guide-anchor.type';

/**
 * Creates a fake div in the center of the screen which can be used to attach "general" tour stops in the center of the screen.
 */
@Component({
  selector: 'center-anchor',
  templateUrl: './center-anchor.component.html',
  styleUrls: ['./center-anchor.component.scss'],
  standalone: false,
})
export class CenterAnchorComponent {
  @Input() public anchorName!: OnboardingGuideAnchor;
}
