import {AvailablePrintSettingsUtils} from './available-print-settings.utils';
import {DocumentFormat, FileFormat, printRules} from '../../shared/interfaces/print-rules.interface';

describe('AvailablePrintSettingsUtils', () => {
  describe('updateUniqueReportLayouts', () => {
    it('should return all document formats for standard report type', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueReportLayouts('standard');
      const expected = Object.values(DocumentFormat).filter((value) => typeof value === 'string') as string[];
      expect(result).toEqual(expected);
    });
    it('should return all document formats for mapset report type', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueReportLayouts('mapset');
      const expected = printRules.availableDocumentFormatsForMapSet.map((format) => DocumentFormat[format]);
      expect(result).toEqual(expected);
    });
  });
  describe('updateUniqueDpiSettings', () => {
    it('should return dpi settings for a A4 report layout', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueDpiSettings('A4');
      const expected = printRules.reportFormats.find(
        (reportFormat) => DocumentFormat[reportFormat.documentFormat] === 'A4',
      )!.availableDpiSettings;
      expect(result).toEqual(expected);
    });
    it('should return dpi settings for a A0 report layout', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueDpiSettings('A0');
      const expected = printRules.reportFormats.find(
        (reportFormat) => DocumentFormat[reportFormat.documentFormat] === 'A0',
      )!.availableDpiSettings;
      expect(result).toEqual(expected);
    });
  });
  describe('updateUniqueFileTypes', () => {
    it('should return all file formats for standard report type and legend true', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('standard', true);
      const expected = printRules.availableFileFormatsForLegend.map((format) => FileFormat[format]);
      expect(result).toEqual(expected);
    });
    it('should return all file formats for standard report type and legend false', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('standard', false);
      const expected = Object.values(FileFormat).filter((value) => typeof value === 'string') as string[];
      expect(result).toEqual(expected);
    });
    it('should return all file formats for mapset report type and legend true', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('mapset', false);
      const expected = printRules.availableFileFormatsForMapSet.map((format) => FileFormat[format]);
      expect(result).toEqual(expected);
    });
  });
});
