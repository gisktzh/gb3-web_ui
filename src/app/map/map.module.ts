import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {LayerWidgetComponent} from './components/layer-widget/layer-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {LegendWidgetComponent} from './components/legend-widget/legend-widget.component';
import {LegendItemComponent} from './components/legend-widget/legend-item/legend-item.component';
import {InfoQueryComponent} from './components/info-query/info-query.component';
import {MapOverlayComponent} from './components/map/map-overlay/map-overlay.component';

@NgModule({
  declarations: [
    MapPageComponent,
    MapComponent,
    LayerWidgetComponent,
    LegendWidgetComponent,
    LegendItemComponent,
    InfoQueryComponent,
    MapOverlayComponent
  ],
  imports: [CommonModule, SharedModule, MapRoutingModule]
})
export class MapModule {}
