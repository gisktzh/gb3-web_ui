import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PrivacyPageComponent} from './components/privacy-page/privacy-page.component';
import {PrivacyRoutingModule} from './privacy-routing.modue';

@NgModule({
  declarations: [PrivacyPageComponent],
  imports: [CommonModule, PrivacyRoutingModule],
})
export class PrivacyModule {}
