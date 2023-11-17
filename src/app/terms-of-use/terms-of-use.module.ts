import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TermsOfUseGeodataAndMapsComponent} from './components/terms-of-use-geodata-and-maps/terms-of-use-geodata-and-maps.component';
import {TermsOfUsePageComponent} from './components/terms-of-use-page/terms-of-use-page.component';
import {UsageHintsComponent} from './components/usage-hints/usage-hints.component';
import {TermsOfUseRoutingModule} from './terms-of-use-routing.module';

@NgModule({
  declarations: [TermsOfUsePageComponent, UsageHintsComponent, TermsOfUseGeodataAndMapsComponent],
  imports: [CommonModule, TermsOfUseRoutingModule, SharedModule],
})
export class TermsOfUseModule {}
