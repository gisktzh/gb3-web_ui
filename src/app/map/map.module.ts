import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MapComponent} from './components/map/map.component';
import {SharedModule} from '../shared/shared.module';
import {ActiveMapItemsWidgetComponent} from './components/active-map-items-widget/active-map-items-widget.component';
import {MapPageComponent} from './map-page.component';
import {MapRoutingModule} from './map-routing.module';
import {LegendWidgetComponent} from './components/legend-widget/legend-widget.component';
import {LegendItemComponent} from './components/legend-widget/legend-item/legend-item.component';
import {FeatureInfoComponent} from './components/feature-info/feature-info.component';
import {LayerCatalogComponent} from './components/layer-catalog/layer-catalog.component';
import {MapOverlayComponent} from './components/map/map-overlay/map-overlay.component';
import {MapOverlayListItemComponent} from './components/map/map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {FeatureInfoItemComponent} from './components/feature-info/feature-info-item/feature-info-item.component';
import {PrintOverlayComponent} from './components/print-overlay/print-overlay.component';
import {PrintDispatcherComponent} from './components/print-overlay/print-dispatcher/print-dispatcher.component';
import {ScaleInputComponent} from './components/map/scale-input/scale-input.component';
import {MapControlsComponent} from './components/map/map-controls/map-controls.component';

@NgModule({
  declarations: [
    MapPageComponent,
    MapComponent,
    ActiveMapItemsWidgetComponent,
    LegendWidgetComponent,
    LegendItemComponent,
    FeatureInfoComponent,
    MapOverlayComponent,
    LayerCatalogComponent,
    MapOverlayListItemComponent,
    FeatureInfoItemComponent,
    PrintOverlayComponent,
    PrintDispatcherComponent,
    ScaleInputComponent,
    MapControlsComponent
  ],
  imports: [CommonModule, SharedModule, MapRoutingModule]
})
export class MapModule {}
