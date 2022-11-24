import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './components/home/home.component';
import {PageRoutingModule} from './page-routing.module';
import {PageComponent} from './page.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [HomeComponent, PageComponent],
  imports: [CommonModule, SharedModule, PageRoutingModule]
})
export class PageModule {}
