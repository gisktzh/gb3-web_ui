import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './components/home/home.component';
import {MapModule} from '../map/map.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, MapModule],
  exports: [HomeComponent]
})
export class PageModule {}
