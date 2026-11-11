import {ToolType} from '../../../shared/types/tool.type';
import {DrawingTool} from '../../../shared/types/drawing-tool.type';
import {MeasurementTool} from '../../../shared/types/measurement-tool.type';
import {DataDownloadSelectionTool} from '../../../shared/types/data-download-selection-tool.type';

export interface EditTarget {
  layerId: string;
  graphicId: string;
}
export type EditableTool = DrawingTool | MeasurementTool | 'select-statistics-polygon';

/** Serializable map ownership. Strategies and graphics belong to the map adapter. */
export type MapInteraction =
  | {kind: 'idle'}
  | {kind: 'create'; id: number; tool: ToolType}
  | {kind: 'edit'; id: number; tool: EditableTool; target: EditTarget}
  | {kind: 'selected'; id: number; tool: DataDownloadSelectionTool};

export interface ToolState {
  interaction: MapInteraction;
  /** Never reset: delayed callbacks must not be mistaken for a newer interaction. */
  sequence: number;
}
