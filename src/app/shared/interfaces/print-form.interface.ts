import {AbstractControl, FormControl} from '@angular/forms';
import {ReportOrientation, ReportType} from './print.interface';
import {DocumentFormat, DpiSetting, FileFormat} from './print-rules.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We need an any here to allow for any type, basically.
type ControlValue<T> = T extends AbstractControl<infer V, any> ? V : never;

type FormGroupValues<T> = {
  [K in keyof T]?: ControlValue<T[K]>;
};

export interface PrintForm {
  title: FormControl<string | null>;
  comment: FormControl<string | null>;
  reportType: FormControl<ReportType | null>;
  layout: FormControl<DocumentFormat | null>;
  reportOrientation: FormControl<ReportOrientation | null>;
  dpi: FormControl<DpiSetting | null>;
  rotation: FormControl<number | null>;
  scale: FormControl<string | null>;
  fileFormat: FormControl<FileFormat | null>;
  showLegend: FormControl<boolean | null>;
}

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

export type PrintFormAvailableOptionsFromCapabilities = ToArrays<PrintFormCapabilitiesCombination>;

export type PrintFormValues = FormGroupValues<PrintForm>;
