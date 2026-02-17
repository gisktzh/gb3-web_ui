import {DocumentFormat, DpiSetting, FileFormat} from './print-rules.interface';
import {ReportOrientation, ReportType} from './print.interface';
import {ReportSizing} from './report-sizing.interface';

interface DefaultPrintSettings {
  reportType: ReportType;
  documentFormat: DocumentFormat;
  fileFormat: FileFormat;
  dpiSetting: DpiSetting;
  orientation: ReportOrientation;
  legend: boolean;
  rotation: number;
}

export interface PrintConfig {
  pixelSizes: {
    [K in keyof typeof DocumentFormat]: {
      [R in ReportOrientation]: ReportSizing;
    };
  };
  defaultPrintValues: DefaultPrintSettings;
  defaultMapSetPrintValues: DefaultPrintSettings;
}
