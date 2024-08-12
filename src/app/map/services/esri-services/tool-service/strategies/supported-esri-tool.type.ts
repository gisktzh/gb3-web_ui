import {EsriSketchTool} from '../../esri.module';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point' | 'rectangle' | 'circle'>;

export type SupportedEsriPolygonTool = Extract<SupportedEsriTool, 'circle' | 'polygon' | 'rectangle'>;
