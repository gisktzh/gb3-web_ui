import {Component, Input} from '@angular/core';
import {OnboardingGuideAnchor} from '../../types/onboarding-guide-anchor.type';
import {TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';

/**
 * Creates a fake div in the center of the screen which can be used to attach "general" tour stops in the center of the screen.
 */
@Component({
  selector: 'center-anchor',
  templateUrl: './center-anchor.component.html',
  styleUrls: ['./center-anchor.component.scss'],
  imports: [TourAnchorMatMenuDirective],
})
export class CenterAnchorComponent {
  @Input() public anchorName!: OnboardingGuideAnchor;
}
