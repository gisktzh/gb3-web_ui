import {DocumentFormat, DpiSetting, FileFormat} from './print-rules.interface';

type ReportOrientation = 'landscape' | 'portrait';

interface DefaultPrintSettings {
  documentFormat: DocumentFormat;
  fileFormat: FileFormat;
  dpiSetting: DpiSetting;
  orientation: ReportOrientation;
  legend: boolean;
}
export interface PrintConfig {
  scales: number[];
  pixelSizes: {
    [K in keyof typeof DocumentFormat]: {
      [K in ReportOrientation]: {
        width: number;
        height: number;
      };
    };
  };
  defaultPrintValues: DefaultPrintSettings;
  defaultMapSetPrintValues: DefaultPrintSettings;
}
