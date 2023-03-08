import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Point from '@arcgis/core/geometry/Point';
import Collection from '@arcgis/core/core/Collection';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import TimeExtent from '@arcgis/core/TimeExtent';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import Color from '@arcgis/core/Color';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import Basemap from '@arcgis/core/Basemap';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import WMSSublayer from '@arcgis/core/layers/support/WMSSublayer';

/** Esri classes/modules */
export const EsriMap = Map;
export const EsriMapView = MapView;
export const EsriWMSLayer = WMSLayer;
export const EsriPoint = Point;
export const EsriCollection = Collection;
export const EsriTimeSlider = TimeSlider;
export const EsriTimeExtent = TimeExtent;
export const EsriReactiveUtils = reactiveUtils;
export const EsriSpatialReference = SpatialReference;
export const EsriGraphic = Graphic;
export const EsriColor = Color;
export const EsriSimpleLineSymbol = SimpleLineSymbol;
export const EsriSimpleMarkerSymbol = SimpleMarkerSymbol;
export const EsriSimpleFillSymbol = SimpleFillSymbol;
export const EsriScaleBar = ScaleBar;
export const EsriBasemap = Basemap;
export const EsriTileInfo = TileInfo;
export const EsriWMSSublayer = WMSSublayer;

/** Esri internal union types */
export type EsriLoadStatus = 'not-loaded' | 'loading' | 'failed' | 'loaded';
export type EsriTimeSliderMode = 'instant' | 'time-window' | 'cumulative-from-start' | 'cumulative-from-end';
