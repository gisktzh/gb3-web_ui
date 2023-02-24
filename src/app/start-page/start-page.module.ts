import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {StartPageRoutingModule} from './start-page-routing.module';
import {StartPageComponent} from './start-page.component';

@NgModule({
  declarations: [StartPageComponent],
  imports: [CommonModule, SharedModule, StartPageRoutingModule]
})
export class StartPageModule {}
