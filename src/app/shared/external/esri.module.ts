import {NgModule} from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Basemap from '@arcgis/core/Basemap';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Slider from '@arcgis/core/widgets/Slider';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import Point from '@arcgis/core/geometry/Point';

export const EsriMap = Map;
export const EsriMapView = MapView;
export const EsriLayerList = LayerList;
export const EsriBasemap = Basemap;
export const EsriWMSLayer = WMSLayer;
export const EsriSlider = Slider;
export const EsriGroupLayer = GroupLayer;
export const EsriPoint = Point;

@NgModule({
  declarations: [],
  imports: []
})
export class EsriModule {}
