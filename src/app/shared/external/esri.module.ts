import {NgModule} from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Basemap from '@arcgis/core/Basemap';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Slider from '@arcgis/core/widgets/Slider';
import GroupLayer from '@arcgis/core/layers/GroupLayer';

export let EsriMap = Map;
export let EsriMapView = MapView;
export let EsriLayerList = LayerList;
export let EsriBasemap = Basemap;
export let EsriWMSLayer = WMSLayer;
export let EsriSlider = Slider;
export let EsriGroupLayer = GroupLayer;

@NgModule({
  declarations: [],
  imports: []
})
export class EsriModule {}
