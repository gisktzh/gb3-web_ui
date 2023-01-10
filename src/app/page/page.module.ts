import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlaceholderPageComponent} from './components/placeholder-page/placeholder-page.component';
import {PageRoutingModule} from './page-routing.module';
import {PageComponent} from './page.component';
import {SharedModule} from '../shared/shared.module';
import {NavbarComponent} from './components/navbar/navbar.component';

@NgModule({
  declarations: [PlaceholderPageComponent, PageComponent, NavbarComponent],
  imports: [CommonModule, SharedModule, PageRoutingModule]
})
export class PageModule {}
