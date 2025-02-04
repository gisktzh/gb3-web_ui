/* eslint-disable @typescript-eslint/naming-convention */

import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {ConfigService} from '../../config.service';
import {Gb3GeneralInfoService} from './gb3-general-info.service';
import {GeneralInfoResponse} from '../../../interfaces/general-info.interface';
import {GeneralInfoListData} from '../../../models/gb3-api-generated.interfaces';
import {SupportedSrs} from '../../../types/supported-srs.type';
import {provideMockStore} from '@ngrx/store/testing';

const mockResponse: GeneralInfoListData = {
  general_info: {
    parcel: {
      bfsnr: 42,
      egris_egrid: 'this-weird-number',
      municipality_name: 'Rivendell',
      oereb_extract: {
        href: 'https://www.test.ch',
      },
      owner: {
        href: 'https://www.ownertest.ch',
      },
    },
    height_dtm: 1337,
    spatial_references: [{name: 'awesome-crs', crs: 'XYZ:123', coordinates: [-50, 150]}],
    height_dom: 555555,
    query_position: {
      srid: 2056,
      x: 11,
      y: 12,
    },
    external_maps: [
      {
        title: 'Other GIS Client',
        href: 'https://www.other-gis-client.ch',
      },
      {
        href: 'https://www.other-gis-client-without-title.ch',
      },
    ],
  },
};

const mockCoord = {
  x: 1337,
  y: 9001,
};

describe('Gb3GeneralInfoService', () => {
  let service: Gb3GeneralInfoService;
  let configService: ConfigService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3GeneralInfoService);
    configService = TestBed.inject(ConfigService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('creates correct url', (done: DoneFn) => {
    spyOn(httpClient, 'get').and.returnValue(of(mockResponse));

    const expected = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/general_info?x=${mockCoord.x}&y=${mockCoord.y}`;

    service.loadGeneralInfo(mockCoord.x, mockCoord.y).subscribe(() => {
      expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
      done();
    });
  });

  it('maps the response correctly', (done: DoneFn) => {
    spyOn(httpClient, 'get').and.returnValue(of(mockResponse));

    const expected: GeneralInfoResponse = {
      parcel: {
        ownershipInformation: {
          url: mockResponse.general_info.parcel!.owner!.href,
        },
        oerebExtract: {
          pdfUrl: mockResponse.general_info.parcel!.oereb_extract!.href,
        },
      },
      externalMaps: [
        {
          name: mockResponse.general_info.external_maps[0].title!,
          url: mockResponse.general_info.external_maps[0].href,
        },
        {
          name: mockResponse.general_info.external_maps[1].href,
          url: mockResponse.general_info.external_maps[1].href,
        },
      ],
      locationInformation: {
        heightDom: mockResponse.general_info.height_dom,
        heightDtm: mockResponse.general_info.height_dtm,
        queryPosition: {
          type: 'Point',
          srs: mockResponse.general_info.query_position.srid as SupportedSrs,
          coordinates: [mockResponse.general_info.query_position.x, mockResponse.general_info.query_position.y],
        },
      },
      alternativeSpatialReferences: [
        {
          name: mockResponse.general_info.spatial_references[0].name,
          crs: mockResponse.general_info.spatial_references[0].crs,
          coordinates: mockResponse.general_info.spatial_references[0].coordinates,
        },
      ],
    };

    service.loadGeneralInfo(mockCoord.x, mockCoord.y).subscribe((result) => {
      expect(result).toEqual(expected);
      done();
    });
  });

  it('handles missing parcel information correctly', (done: DoneFn) => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      general_info: {parcel, ...parcelLessInformation},
    } = mockResponse;
    spyOn(httpClient, 'get').and.returnValue(of({general_info: parcelLessInformation}));

    const expected: GeneralInfoResponse = {
      parcel: undefined,
      externalMaps: [
        {
          name: mockResponse.general_info.external_maps[0].title!,
          url: mockResponse.general_info.external_maps[0].href,
        },
        {
          name: mockResponse.general_info.external_maps[1].href,
          url: mockResponse.general_info.external_maps[1].href,
        },
      ],
      locationInformation: {
        heightDom: mockResponse.general_info.height_dom,
        heightDtm: mockResponse.general_info.height_dtm,
        queryPosition: {
          type: 'Point',
          srs: mockResponse.general_info.query_position.srid as SupportedSrs,
          coordinates: [mockResponse.general_info.query_position.x, mockResponse.general_info.query_position.y],
        },
      },
      alternativeSpatialReferences: [
        {
          name: mockResponse.general_info.spatial_references[0].name,
          crs: mockResponse.general_info.spatial_references[0].crs,
          coordinates: mockResponse.general_info.spatial_references[0].coordinates,
        },
      ],
    };

    service.loadGeneralInfo(mockCoord.x, mockCoord.y).subscribe((result) => {
      expect(result).toEqual(expected);
      done();
    });
  });

  it('handles missing parcel urls correctly', (done: DoneFn) => {
    const response = structuredClone(mockResponse);
    response.general_info.parcel!.oereb_extract = null;
    response.general_info.parcel!.owner = null;

    spyOn(httpClient, 'get').and.returnValue(of(response));

    service.loadGeneralInfo(mockCoord.x, mockCoord.y).subscribe((result) => {
      expect(result.parcel?.ownershipInformation.url).toBeNull();
      expect(result.parcel?.oerebExtract.pdfUrl).toBeNull();
      done();
    });
  });
});
