import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [MapComponent],
  imports: [CommonModule, SharedModule],
  exports: [MapComponent]
})
export class MapModule {}
