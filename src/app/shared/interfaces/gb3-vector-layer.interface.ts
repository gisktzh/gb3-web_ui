import {SupportedGeometry} from '../types/SupportedGeometry.type';
import {AbstractGb3Layer} from './abstract-gb3-layer.interface';
import {SupportedEsriTool} from '../../map/services/esri-services/tool-service/strategies/supported-esri-tool.type';

export interface Gb3GeoJsonFeature {
  type: 'Feature';
  properties: {
    /**
     * UUID of the given feature
     */
    id: string;
    /**
     * UUID if the feature has a belongsTo relationship with another feature, e.g. the label of a measurement.
     */
    belongsTo?: string;
    /**
     * Reference to style ID in 'styles'
     * @example "a"
     */
    style: string;
    /**
     * Text to display if using text marker style
     * @example "Label text"
     */
    text?: string;
    /**
     * The tool used to draw the feature
     * @example "polygon"
     */
    tool: SupportedEsriTool;
  };
  geometry: SupportedGeometry;
}

export interface Gb3VectorLayerStyle {
  /** Style definition based on OpenLayers 2 Symbolizer */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- inherited from OpenLayers 2
}

export interface Gb3VectorLayer extends AbstractGb3Layer {
  /** Vector layer type */
  type: 'Vector';
  /**
   * GeoJSON FeatureCollection
   * @example {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"style":"a"},"geometry":{"type":"Point","coordinates":[2683465,1248055]}}]}
   */
  geojson: {
    /** GeoJSON FeatureCollection */
    type: 'FeatureCollection';
    features: Gb3GeoJsonFeature[];
  };
  /**
   * Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property
   * @example {"a":{"pointRadius":15,"fillColor":"#ee3333","fillOpacity":0,"strokeColor":"#ee3333","strokeWidth":3}}
   */
  styles: Gb3VectorLayerStyle;
}
