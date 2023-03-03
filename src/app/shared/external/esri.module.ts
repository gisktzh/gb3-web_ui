import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Point from '@arcgis/core/geometry/Point';
import Collection from '@arcgis/core/core/Collection';

// TODO WES: remove

export const EsriMap = Map;
export const EsriMapView = MapView;
export const EsriWMSLayer = WMSLayer;
export const EsriPoint = Point;
export const EsriCollection = Collection;

export type EsriLoadStatus = 'not-loaded' | 'loading' | 'failed' | 'loaded';
