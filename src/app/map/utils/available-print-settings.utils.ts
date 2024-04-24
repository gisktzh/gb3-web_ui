import {ReportType} from '../../shared/interfaces/print.interface';
import {DocumentFormat, FileFormat, printRules} from '../../shared/interfaces/print-rules.interface';

export class AvailablePrintSettingsUtils {
  public static updateUniqueReportLayouts(reportType: ReportType) {
    return reportType === 'standard'
      ? (Object.values(DocumentFormat).filter((value) => typeof value === 'string') as string[])
      : printRules.availableDocumentFormatsForMapSet.map((layout) => DocumentFormat[layout]);
  }

  public static updateUniqueDpiSettings(reportLayout: string) {
    return printRules.reportFormats.find((reportFormat) => DocumentFormat[reportFormat.documentFormat] === reportLayout)!
      .availableDpiSettings;
  }

  public static updateUniqueFileTypes(reportType: ReportType, showLegend: boolean) {
    const allAvailableFileFormats = Object.values(FileFormat).filter((value) => typeof value === 'string') as string[];
    const availableFileFormatsForLegend = showLegend
      ? printRules.availableFileFormatsForLegend.map((fileFormat) => FileFormat[fileFormat])
      : allAvailableFileFormats;
    const availableFileFormatsForMapSet =
      reportType === 'mapset'
        ? printRules.availableFileFormatsForMapSet.map((fileFormat) => FileFormat[fileFormat])
        : allAvailableFileFormats;

    return allAvailableFileFormats.filter(
      (format) => availableFileFormatsForLegend.includes(format) && availableFileFormatsForMapSet.includes(format),
    );
  }
}
