import {SupportedGeometry} from '../types/SupportedGeometry.type';

export interface Gb3GeoJsonFeature {
  type: 'Feature';
  properties: {
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
  };
  geometry: SupportedGeometry;
}

export interface Gb3VectorLayer {
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
  styles: {
    /** Style definition based on OpenLayers 2 Symbolizer */
  };
}
