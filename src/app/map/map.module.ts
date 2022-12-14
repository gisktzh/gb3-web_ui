import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {ActiveLayerWidgetComponent} from './components/active-layer-widget/active-layer-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {LegendWidgetComponent} from './components/legend-widget/legend-widget.component';
import {LegendItemComponent} from './components/legend-widget/legend-item/legend-item.component';
import {FeatureInfoComponent} from './components/feature-info/feature-info.component';
import {LayerCatalogComponent} from './components/layer-catalog/layer-catalog.component';
import {MapOverlayComponent} from './components/map/map-overlay/map-overlay.component';
import {
  MapOverlayListItemComponent
} from './components/map/map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {FeatureInfoItemComponent} from './components/feature-info/feature-info-item/feature-info-item.component';

@NgModule({
  declarations: [
    MapPageComponent,
    MapComponent,
    ActiveLayerWidgetComponent,
    LegendWidgetComponent,
    LegendItemComponent,
    FeatureInfoComponent,
    MapOverlayComponent,
    LayerCatalogComponent,
    MapOverlayListItemComponent,
    FeatureInfoItemComponent
  ],
  imports: [CommonModule, SharedModule, MapRoutingModule]
})
export class MapModule {}
