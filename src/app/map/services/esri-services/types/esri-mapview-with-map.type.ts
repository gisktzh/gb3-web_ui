import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';

export type MapViewWithMap = MapView & {map: Map};
