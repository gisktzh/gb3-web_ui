export enum DocumentFormat {
  A0,
  A1,
  A2,
  A3,
  A4,
}

/**
 * These choices are used in the GUI to populate the dropdown.

 */
export enum DpiSetting {
  'low' = 150,
  'high' = 300,
}

/**
 * These choices are used in the GUI to populate the dropdown.
 */
export enum FileFormat {
  pdf,
  png,
  tiff,
  gif,
}

/**
 * Each report format has a document format and a list of available DPI settings.
 */
interface ReportFormat {
  documentFormat: DocumentFormat;
  availableDpiSettings: DpiSetting[];
}

/**
 * Printrules specify the available report formats and the available file formats for the legend.
 */
export interface PrintRules {
  reportFormats: ReportFormat[];
  availableFileFormatsForLegend: FileFormat[]; // technically, only PDF is supported, but in case it is extended
  availableFileFormatsForMapSet: FileFormat[]; // technically, only PDF is supported, but in case it is extended
  availableDocumentFormatsForMapSet: DocumentFormat[]; // technically, only A4 is supported, but in case it is extended
}

/**
 * Note: _all_ formats can be quer/hoch, so this is not explicitly labelled.
 */
export const printRules: PrintRules = {
  reportFormats: [
    {
      documentFormat: DocumentFormat.A0,
      availableDpiSettings: [DpiSetting.low],
    },
    {
      documentFormat: DocumentFormat.A1,
      availableDpiSettings: [DpiSetting.low, DpiSetting.high],
    },
    {
      documentFormat: DocumentFormat.A2,
      availableDpiSettings: [DpiSetting.low, DpiSetting.high],
    },
    {
      documentFormat: DocumentFormat.A3,
      availableDpiSettings: [DpiSetting.low, DpiSetting.high],
    },
    {
      documentFormat: DocumentFormat.A4,
      availableDpiSettings: [DpiSetting.low, DpiSetting.high],
    },
  ],
  availableFileFormatsForLegend: [FileFormat.pdf],
  availableFileFormatsForMapSet: [FileFormat.pdf],
  availableDocumentFormatsForMapSet: [DocumentFormat.A4],
};
