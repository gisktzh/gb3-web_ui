import {NgModule} from '@angular/core';
import {SupportPageComponent} from './support-page.component';
import {SupportPageRoutingModule} from './support-page-routing.module';
import {SharedModule} from '../shared/shared.module';
import {FaqComponent} from './components/faq/faq.component';
import {ContactComponent} from './components/contact/contact.component';
import {UsefulInformationComponent} from './components/useful-information/useful-information.component';
import {CommonModule} from '@angular/common';
import {SupportPageNavigationComponent} from './components/support-page-navigation/support-page-navigation.component';

@NgModule({
  declarations: [SupportPageComponent, FaqComponent, ContactComponent, UsefulInformationComponent, SupportPageNavigationComponent],
  imports: [CommonModule, SharedModule, SupportPageRoutingModule],
})
export class SupportPageModule {}
