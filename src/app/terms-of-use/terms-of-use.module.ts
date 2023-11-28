import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TermsOfUseGeodataAndMapsComponent} from './components/terms-of-use-geodata-and-maps/terms-of-use-geodata-and-maps.component';
import {TermsOfUsePageComponent} from './terms-of-use-page.component';
import {UsageRulesComponent} from './components/usage-rules/usage-rules.component';
import {TermsOfUseRoutingModule} from './terms-of-use-routing.module';

@NgModule({
  declarations: [TermsOfUsePageComponent, UsageRulesComponent, TermsOfUseGeodataAndMapsComponent],
  imports: [CommonModule, TermsOfUseRoutingModule, SharedModule],
})
export class TermsOfUseModule {}
