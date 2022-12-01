import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {ActiveLayerWidgetComponent} from './components/active-layer-widget/active-layer-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {LegendWidgetComponent} from './components/legend-widget/legend-widget.component';
import {LegendItemComponent} from './components/legend-widget/legend-item/legend-item.component';

@NgModule({
  declarations: [MapPageComponent, MapComponent, ActiveLayerWidgetComponent, LegendWidgetComponent, LegendItemComponent],
  imports: [CommonModule, SharedModule, MapRoutingModule]
})
export class MapModule {}
