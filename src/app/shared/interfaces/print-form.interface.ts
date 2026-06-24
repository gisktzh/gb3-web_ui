import {ReportOrientation, ReportType} from './print.interface';
import {DocumentFormat, DpiSetting, FileFormat} from './print-rules.interface';

export type ToArrays<T> = {
  [K in keyof T]: Array<T[K]>;
};

export interface PrintFormCapabilitiesCombination {
  reportType: ReportType;
  reportOrientation: ReportOrientation;
  layout: DocumentFormat;
  dpi: DpiSetting;
  fileFormat: FileFormat;
  showLegend: boolean;
}

export interface PrintFormValues {
  title: string;
  comment: string;
  reportType: ReportType;
  layout: DocumentFormat;
  reportOrientation: ReportOrientation;
  dpi: DpiSetting;
  rotation: number;
  scale: string;
  fileFormat: FileFormat;
  showLegend: boolean;
}

export type PrintFormAvailableOptionsFromCapabilities = ToArrays<PrintFormCapabilitiesCombination>;

export type PrintFormAvailableCheckPriorityList = (keyof PrintFormCapabilitiesCombination)[];
