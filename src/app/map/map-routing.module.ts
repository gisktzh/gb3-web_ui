import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MapPageComponent} from './map-page.component';
import {SharedModule} from '../shared/shared.module';
import {ONBOARDING_STEPS, OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {mapOnboardingGuideConfig} from '../onboarding-guide/data/map-onboarding-guide.config';

const routes: Routes = [
  {
    path: '',
    component: MapPageComponent
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  providers: [OnboardingGuideService, {provide: ONBOARDING_STEPS, useValue: mapOnboardingGuideConfig}]
})
export class MapRoutingModule {}
