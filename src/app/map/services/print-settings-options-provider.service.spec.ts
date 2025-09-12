import {TestBed} from '@angular/core/testing';

import {PrintSettingsOptionsProviderService} from './print-settings-options-provider.service';
import {PrintCapabilitiesCombination} from 'src/app/shared/models/gb3-api-generated.interfaces';
import {DocumentFormat, DpiSetting, FileFormat} from 'src/app/shared/interfaces/print-rules.interface';
import {ReportOrientation, ReportType} from 'src/app/shared/interfaces/print.interface';

describe('PrintSettingsOptionsProvider', () => {
  let service: PrintSettingsOptionsProviderService;

  // We sort them, so we can equal.
  const validReportTypes: ReportType[] = ['standard', 'mapset'].sort() as ReportType[];
  const validReportOrientations: ReportOrientation[] = ['portrait', 'landscape'].sort() as ReportOrientation[];
  const validLayouts: DocumentFormat[] = [DocumentFormat.A0, DocumentFormat.A1, DocumentFormat.A2].sort();
  const validFileFormats: FileFormat[] = [FileFormat.png, FileFormat.pdf].sort();
  const validDpis: DpiSetting[] = [DpiSetting.low, DpiSetting.high].sort();
  const validShowLegend = [true, false].sort();

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
                showLegend,
                fileFormat,
                dpi,
                layout,
                reportType,
                reportOrientation,
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
    expect(service.getUnqiueOptions<'showLegend'>(validCombinations, 'showLegend').sort()).toEqual(validShowLegend);
    expect(service.getUnqiueOptions<'fileFormat'>(validCombinations, 'fileFormat').sort()).toEqual(validFileFormats);
    expect(service.getUnqiueOptions<'dpi'>(validCombinations, 'dpi').sort()).toEqual(validDpis);
    expect(service.getUnqiueOptions<'layout'>(validCombinations, 'layout').sort()).toEqual(validLayouts);
    expect(service.getUnqiueOptions<'reportType'>(validCombinations, 'reportType').sort()).toEqual(validReportTypes);
    expect(service.getUnqiueOptions<'reportOrientation'>(validCombinations, 'reportOrientation').sort()).toEqual(validReportOrientations);
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
