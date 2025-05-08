import {EsriSketchTool} from '../../types/esri-sketch-tool.type';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point' | 'rectangle' | 'circle'>;
export type SupportedEsriPolygonTool = Extract<SupportedEsriTool, 'circle' | 'polygon' | 'rectangle'>;
