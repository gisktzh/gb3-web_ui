import {TestBed} from '@angular/core/testing';

import {PrintSettingsOptionsProviderService} from './print-settings-options-provider.service';
import {PrintCapabilitiesCombination} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {DocumentFormat, DpiSetting, FileFormat} from 'src/app/shared/interfaces/print-rules.interface';
import {ReportOrientation, ReportType} from 'src/app/shared/interfaces/print.interface';

describe('PrintSettingsOptionsProvider', () => {
  let service: PrintSettingsOptionsProviderService;

  // We sort them, so we can equal.
  const validReportTypes: ReportType[] = ['mapset', 'standard'] as ReportType[];
  const validReportOrientations: ReportOrientation[] = ['landscape', 'portrait'] as ReportOrientation[];
  const validLayouts: DocumentFormat[] = [DocumentFormat.A0, DocumentFormat.A1, DocumentFormat.A2];
  const validFileFormats: FileFormat[] = [FileFormat.pdf, FileFormat.png];
  const validDpis: DpiSetting[] = [DpiSetting.low, DpiSetting.high];
  const validShowLegend = [false, true];

  const validCombinations: PrintCapabilitiesCombination[] = [];
  validShowLegend.forEach((showLegend) => {
    validFileFormats.forEach((fileFormat) => {
      if (showLegend && fileFormat !== FileFormat.pdf) {
        return;
      }

      validDpis.forEach((dpi) => {
        validLayouts.forEach((layout) => {
          if (dpi === DpiSetting.high && layout === DocumentFormat.A0) {
            return;
          }

          validReportTypes.forEach((reportType) => {
            validReportOrientations.forEach((reportOrientation) => {
              validCombinations.push({
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Necessary to comply with interface coming from GB2 API.
                show_legend: showLegend,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Necessary to comply with interface coming from GB2 API.
                file_format: fileFormat,
                dpi,
                layout,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Necessary to comply with interface coming from GB2 API.
                report_type: reportType,
                // eslint-disable-next-line @typescript-eslint/naming-convention -- Necessary to comply with interface coming from GB2 API.
                report_orientation: reportOrientation,
              });
            });
          });
        });
      });
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintSettingsOptionsProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return only unqiue values for a given key', () => {
    service.getUnqiueOptions<'show_legend'>(validCombinations, 'show_legend').forEach((v) => {
      expect(validShowLegend).toContain(v);
    });
    service.getUnqiueOptions<'file_format'>(validCombinations, 'file_format').forEach((v) => {
      expect(validFileFormats).toContain(v);
    });
    service.getUnqiueOptions<'dpi'>(validCombinations, 'dpi').forEach((v) => {
      expect(validDpis).toContain(v);
    });
    service.getUnqiueOptions<'layout'>(validCombinations, 'layout').forEach((v) => {
      expect(validLayouts).toContain(v);
    });
    service.getUnqiueOptions<'report_type'>(validCombinations, 'report_type').forEach((v) => {
      expect(validReportTypes).toContain(v);
    });
    service.getUnqiueOptions<'report_orientation'>(validCombinations, 'report_orientation').forEach((v) => {
      expect(validReportOrientations).toContain(v);
    });
  });

  it('should filter out options that are not in a valid combo and ignore undefined values', () => {
    const available = service.filterOptions(
      {
        dpi: 300,
      },
      validCombinations,
      ['dpi', 'showLegend', 'fileFormat', 'layout', 'reportType', 'reportOrientation'],
    );

    expect(available.dpi).toEqual(validDpis);
    expect(available.layout).not.toContain(DocumentFormat.A0);
    expect(available.layout).toContain(DocumentFormat.A1);
    expect(available.layout).toContain(DocumentFormat.A2);
    expect(available.showLegend).toEqual(validShowLegend);
    expect(available.reportOrientation).toEqual(validReportOrientations);
  });

  it('should respect the checking priority order', () => {
    const availableDpiFirst = service.filterOptions(
      {
        dpi: 300,
        layout: DocumentFormat.A0,
      },
      validCombinations,
      ['dpi', 'showLegend', 'fileFormat', 'layout', 'reportType', 'reportOrientation'],
    );

    const availableLayoutFirst = service.filterOptions(
      {
        dpi: 300,
        layout: DocumentFormat.A0,
      },
      validCombinations,
      ['layout', 'dpi', 'showLegend', 'fileFormat', 'reportType', 'reportOrientation'],
    );

    expect(availableDpiFirst.dpi).toEqual(validDpis);
    expect(availableDpiFirst.layout).not.toContain(DocumentFormat.A0);
    expect(availableDpiFirst.layout).toContain(DocumentFormat.A1);
    expect(availableDpiFirst.layout).toContain(DocumentFormat.A2);

    expect(availableLayoutFirst.layout).toEqual(validLayouts);
    expect(availableLayoutFirst.dpi).not.toContain(DpiSetting.high);
    expect(availableLayoutFirst.dpi).toContain(DpiSetting.low);
  });
});
