import {DocumentFormat, DpiSetting, FileFormat} from './print-rules.interface';
import {ReportOrientation} from './print.interface';

export type ReportOrientationE = 'landscape' | 'portrait';

interface DefaultPrintSettings {
  documentFormat: DocumentFormat;
  fileFormat: FileFormat;
  dpiSetting: DpiSetting;
  orientation: ReportOrientation;
  legend: boolean;
  rotation: number;
}

export interface PrintConfig {
  scales: number[];
  pixelSizes: {
    [K in keyof typeof DocumentFormat]: {
      [K in ReportOrientationE]: {
        width: number;
        height: number;
      };
    };
  };
  defaultPrintValues: DefaultPrintSettings;
  defaultMapSetPrintValues: DefaultPrintSettings;
}
