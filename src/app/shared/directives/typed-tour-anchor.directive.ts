import {Directive, input, Input, OnInit} from '@angular/core';
import {TourAnchorMatMenuDirective} from 'ngx-ui-tour-md-menu';
import {OnboardingGuideAnchor} from '../../onboarding-guide/types/onboarding-guide-anchor.type';
import {SIGNAL} from '@angular/core/primitives/signals';

/**
 * An extension of the TourAnchor directive of the ngx-ui-tour package which forces the usage of anchors that are defined in the
 * OnboardingGuideAnchor type. This is preferrable to using TourAnchor directly because its string identifiers would be all over the place.
 */
@Directive({selector: '[typedTourAnchor]'})
export class TypedTourAnchorDirective extends TourAnchorMatMenuDirective implements OnInit {
  @Input() public typedTourAnchor!: OnboardingGuideAnchor;

  override ngOnInit() {
    this.tourAnchor[SIGNAL].value = this.typedTourAnchor;
    super.ngOnInit();
  }
}
