import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TourMatMenuModule} from 'ngx-ui-tour-md-menu';
import {CenterAnchorComponent} from './components/center-anchor/center-anchor.component';
import {OnboardingGuideComponent} from './components/onboarding-guide/onboarding-guide.component';
import {MaterialModule} from '../shared/external/material.module';

@NgModule({
  declarations: [CenterAnchorComponent, OnboardingGuideComponent],
  imports: [CommonModule, TourMatMenuModule, MaterialModule],
  exports: [TourMatMenuModule, CenterAnchorComponent, OnboardingGuideComponent],
})
export class OnboardingGuideModule {}
