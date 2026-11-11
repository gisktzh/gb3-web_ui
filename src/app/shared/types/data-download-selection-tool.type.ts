export type DataDownloadSelectionTool =
  | 'select-circle'
  | 'select-polygon'
  | 'select-rectangle'
  | 'select-section'
  | 'select-federation'
  | 'select-canton'
  | 'select-municipality';

export function isDataDownloadSelectionTool(tool: string): tool is DataDownloadSelectionTool {
  return [
    'select-circle',
    'select-polygon',
    'select-rectangle',
    'select-section',
    'select-federation',
    'select-canton',
    'select-municipality',
  ].includes(tool);
}
