import {AvailablePrintSettingsUtils} from './available-print-settings.utils';

describe('AvailablePrintSettingsUtils', () => {
  describe('updateUniqueReportLayouts', () => {
    it('should return all document formats for standard report type', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueReportLayouts('standard');
      const expected = ['A0', 'A1', 'A2', 'A3', 'A4'];
      expect(result).toEqual(expected);
    });
    it('should return all document formats for mapset report type', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueReportLayouts('mapset');
      const expected = ['A4'];
      expect(result).toEqual(expected);
    });
  });
  describe('updateUniqueDpiSettings', () => {
    it('should return dpi settings for a A4 report layout', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueDpiSettings('A4');
      const expected = [150, 300];
      expect(result).toEqual(expected);
    });
    it('should return dpi settings for a A0 report layout', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueDpiSettings('A0');
      const expected = [150];
      expect(result).toEqual(expected);
    });
  });
  describe('updateUniqueFileTypes', () => {
    it('should return all file formats for standard report type and legend true', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('standard', true);
      const expected = ['pdf'];
      expect(result).toEqual(expected);
    });
    it('should return all file formats for standard report type and legend false', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('standard', false);
      const expected = ['pdf', 'png', 'tif', 'gif'];
      expect(result).toEqual(expected);
    });
    it('should return all file formats for mapset report type and legend true', () => {
      const result = AvailablePrintSettingsUtils.updateUniqueFileTypes('mapset', false);
      const expected = ['pdf'];
      expect(result).toEqual(expected);
    });
  });
});
