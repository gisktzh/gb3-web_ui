import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {PrivacyPageComponent} from './components/privacy-page/privacy-page.component';
import {PrivacyRoutingModule} from './privacy-routing.modue';
import {PrivacyContentComponent} from './components/privacy-content/privacy-content.component';

@NgModule({
  declarations: [PrivacyPageComponent, PrivacyContentComponent],
  imports: [CommonModule, PrivacyRoutingModule, SharedModule],
})
export class PrivacyModule {}
