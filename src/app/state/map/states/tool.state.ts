export type MeasurementTool = 'measure-line' | 'measure-point' | 'measure-area';
export type ToolType = MeasurementTool; // todo: add drawing tools

export interface ToolState {
  activeTool: ToolType | undefined;
}
