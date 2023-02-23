import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TourMatMenuModule} from 'ngx-ui-tour-md-menu';
import {CenterAnchorComponent} from './center-anchor/center-anchor.component';
import {OnboardingGuideComponent} from './onboarding-guide/onboarding-guide.component';
import {MaterialModule} from '../../shared/external/material.module';
import {TypedTourAnchorDirective} from './directives/typed-tour-anchor.directive';

@NgModule({
  declarations: [CenterAnchorComponent, OnboardingGuideComponent, TypedTourAnchorDirective],
  imports: [CommonModule, TourMatMenuModule, MaterialModule],
  exports: [TourMatMenuModule, CenterAnchorComponent, OnboardingGuideComponent, TypedTourAnchorDirective]
})
export class OnboardingGuideModule {}
