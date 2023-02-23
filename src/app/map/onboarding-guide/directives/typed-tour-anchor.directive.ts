import {Directive, Input, OnInit} from '@angular/core';
import {TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';
import {OnboardingGuideAnchor} from '../onboarding-guide-steps';

@Directive({
  selector: '[typedTourAnchor]'
})
export class TypedTourAnchorDirective extends TourAnchorMatMenuDirective implements OnInit {
  @Input() public typedTourAnchor!: OnboardingGuideAnchor;

  override ngOnInit() {
    this.tourAnchor = this.typedTourAnchor;
    super.ngOnInit();
  }
}
