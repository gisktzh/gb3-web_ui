/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {ConfigService} from '../../config.service';
import {Municipality, MunicipalityWithGeometry} from '../../../interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopMunicipalitiesService} from './gb3-geoshop-municipalities.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('Gb3GeoshopMunicipalitiesService', () => {
  let service: Gb3GeoshopMunicipalitiesService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3GeoshopMunicipalitiesService);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadMunicipalities', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        timestamp: '2023-11-27T08:57:53.906390',
        municipalities: [
          {
            bfs_no: 131,
            name: 'Adliswil',
          },
          {
            bfs_no: 241,
            name: 'Aesch (ZH)',
          },
          {
            bfs_no: 1,
            name: 'Aeugst am Albis',
          },
          {
            bfs_no: 2,
            name: 'Affoltern am Albis',
          },
        ],
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: Municipality[] = [
        {
          bfsNo: 131,
          name: 'Adliswil',
        },
        {
          bfsNo: 241,
          name: 'Aesch (ZH)',
        },
        {
          bfsNo: 1,
          name: 'Aeugst am Albis',
        },
        {
          bfsNo: 2,
          name: 'Affoltern am Albis',
        },
      ];

      service.loadMunicipalities().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/municipalities`,
        );
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('loadMunicipalityWithGeometry', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        timestamp: '2023-11-27T09:37:53.025239',
        municipality: {
          bfs_no: 1,
          name: 'Aeugst am Albis',
          boundingbox: {
            type: 'Polygon',
            coordinates: [
              [
                [2678110.7, 1234561],
                [2678110.7, 1238543.7],
                [2681154.9, 1238543.7],
                [2681154.9, 1234561],
                [2678110.7, 1234561],
              ],
            ],
          },
        },
      };
      const bfsNo = 1;
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: MunicipalityWithGeometry = {
        bfsNo: 1,
        name: 'Aeugst am Albis',
        boundingBox: {
          type: 'Polygon',
          coordinates: [
            [
              [2678110.7, 1234561],
              [2678110.7, 1238543.7],
              [2681154.9, 1238543.7],
              [2681154.9, 1234561],
              [2678110.7, 1234561],
            ],
          ],
        },
      };

      service.loadMunicipalityWithGeometry(bfsNo).subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/municipalities/${bfsNo}`,
        );
        expect(actual).toEqual(expected);
        done();
      });
    });
  });
});
