import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmbeddedMapPageComponent} from './embedded-map-page.component';
import {SharedModule} from '../shared/shared.module';
import {MapModule} from '../map/map.module';
import {EmbeddedMapPageRoutingModule} from './embedded-map-page-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, EmbeddedMapPageRoutingModule, MapModule, EmbeddedMapPageComponent],
})
export class EmbeddedMapPageModule {}
