export type SupportedDrawingTool = 'polygon' | 'polyline' | 'point' | 'rectangle' | 'circle';

export type SupportedPolygonDrawingTool = Extract<SupportedDrawingTool, 'circle' | 'polygon' | 'rectangle'>;
