import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {PrintCapabilitiesListData, PrintCreateData, PrintNew} from '../../../models/gb3-api-generated.interfaces';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {Gb3PrintService} from './gb3-print.service';
import {PrintCreation} from '../../../interfaces/print.interface';
import {ConfigService} from '../../config.service';

describe('Gb3PrintService', () => {
  let service: Gb3PrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Gb3PrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load print capabilities', () => {
    const mockData: PrintCapabilitiesListData = {
      print: {
        formats: ['pdf', 'png', 'tif', 'gif'],
        dpis: [300, 150],
        reports: [
          {
            name: 'A4 hoch',
            map: {
              width: 520,
              height: 660,
            },
          },
          {
            name: 'A4 quer',
            map: {
              width: 770,
              height: 420,
            },
          },
          {
            name: 'A3 hoch',
            map: {
              width: 770,
              height: 1010,
            },
          },
          {
            name: 'A3 quer',
            map: {
              width: 1120,
              height: 670,
            },
          },
          {
            name: 'A2 hoch',
            map: {
              width: 1118,
              height: 1430,
            },
          },
          {
            name: 'A2 quer',
            map: {
              width: 1600,
              height: 970,
            },
          },
          {
            name: 'A1 hoch',
            map: {
              width: 1620,
              height: 2050,
            },
          },
          {
            name: 'A1 quer',
            map: {
              width: 2320,
              height: 1340,
            },
          },
          {
            name: 'A0 hoch',
            map: {
              width: 2290,
              height: 3020,
            },
          },
          {
            name: 'A0 quer',
            map: {
              width: 3300,
              height: 2070,
            },
          },
          {
            name: 'Kartenset',
            map: {
              width: 520,
              height: 660,
            },
          },
        ],
      },
    };

    it('should receive the data and transform it', (done: DoneFn) => {
      const httpClient = TestBed.inject(HttpClient);
      spyOn(httpClient, 'get').and.returnValue(of(mockData));
      service.loadPrintCapabilities().subscribe((capabilities) => {
        expect(capabilities).toBeDefined();
        expect(capabilities.reports.length).toBe(mockData.print.reports.length);
        mockData.print.reports.forEach((mockReport) => {
          const actualReport = capabilities.reports.find(
            (report) => mockReport.name === (report.orientation ? `${report.layout} ${report.orientation}` : report.layout),
          );
          expect(actualReport).toBeDefined();
          expect(actualReport!.map).toEqual(mockReport.map);
        });
        expect(capabilities.formats).toEqual(jasmine.arrayWithExactContents(mockData.print.formats));
        expect(capabilities.dpis).toEqual(jasmine.arrayWithExactContents(mockData.print.dpis));
        done();
      });
    });
  });

  describe('create print job', () => {
    const printCreationMock: PrintCreation = {
      format: 'tschif',
      reportLayout: 'mobile',
      reportOrientation: 'hoch',
      attributes: {
        reportTitle: 'Passierschein a38',
        userTitle: 'Haus, das Verrückte macht',
        userComment: 'Die Spinnen, die Römer',
        showLegend: true,
      },
      map: {
        dpi: 9001,
        rotation: 42,
        scale: 123_456_789,
        center: [12.3, 45.6],
        mapItems: [
          {
            type: 'WMS',
            mapTitle: 'karte 1',
            customParams: {
              myCustomParamOne: 'myCustomValue',
            },
            background: false,
            layers: ['gott', 'würfelt', 'nicht'],
            url: 'url 1',
            opacity: 0.666,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 2',
            background: false,
            layers: ['holla', 'die', 'waldfee'],
            url: 'url 2',
            opacity: 1,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 3',
            background: false,
            layers: ['yolo'],
            url: 'url 3',
            opacity: 1,
          },
          {
            type: 'WMS',
            mapTitle: 'karte 4',
            background: true,
            layers: [],
            url: 'url 4',
            opacity: 1,
          },
        ],
      },
    };

    const transformedPrintCreationMock: PrintNew = {
      format: 'tschif',
      report: 'mobile hoch',
      attributes: {
        report_title: 'Passierschein a38',
        user_title: 'Haus, das Verrückte macht',
        user_comment: 'Die Spinnen, die Römer',
        show_legend: true,
      },
      map: {
        dpi: 9001,
        rotation: 42,
        scale: 123_456_789,
        center: [12.3, 45.6],
        layers: [
          {
            type: 'WMS',
            map_title: 'karte 1',
            custom_params: {
              myCustomParamOne: 'myCustomValue',
            },
            background: false,
            layers: ['gott', 'würfelt', 'nicht'],
            url: 'url 1',
            opacity: 0.666,
          },
          {
            type: 'WMS',
            map_title: 'karte 2',
            custom_params: undefined,
            background: false,
            layers: ['holla', 'die', 'waldfee'],
            url: 'url 2',
            opacity: 1,
          },
          {
            type: 'WMS',
            map_title: 'karte 3',
            custom_params: undefined,
            background: false,
            layers: ['yolo'],
            url: 'url 3',
            opacity: 1,
          },
          {
            type: 'WMS',
            map_title: 'karte 4',
            custom_params: undefined,
            background: true,
            layers: [],
            url: 'url 4',
            opacity: 1,
          },
        ],
      },
    };

    const printResponseMock: PrintCreateData = {report_url: 'result url mock'};

    it('should transform and send print jobs', (done: DoneFn) => {
      const configService = TestBed.inject(ConfigService);
      const httpClient = TestBed.inject(HttpClient);
      const postCallSpy = spyOn(httpClient, 'post').and.returnValue(of(printResponseMock));

      service.createPrintJob(printCreationMock).subscribe((response) => {
        expect(response.reportUrl).toBe(printResponseMock.report_url);
        expect(postCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.gb2Api.baseUrl}/print`, transformedPrintCreationMock, {
          headers: undefined,
        });
        done();
      });
    });
  });
});
