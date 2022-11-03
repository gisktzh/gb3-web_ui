import {NgModule} from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

export let EsriMap = Map;
export let EsriMapView = MapView;

@NgModule({
  declarations: [],
  imports: []
})
export class EsriModule {}
