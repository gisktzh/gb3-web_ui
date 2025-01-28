export type DataDownloadSelectionGeometry = 'polygon' | 'federation' | 'canton' | 'municipality';
export type BoundingBoxDataDownloadSelectionGeometry = Exclude<DataDownloadSelectionGeometry, 'municipality' | 'polygon'>;
