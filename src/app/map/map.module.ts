import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {LayerWidgetComponent} from './components/layer-widget/layer-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';

@NgModule({
  declarations: [MapPageComponent, MapComponent, LayerWidgetComponent],
  imports: [CommonModule, SharedModule, MapRoutingModule]
})
export class MapModule {}
