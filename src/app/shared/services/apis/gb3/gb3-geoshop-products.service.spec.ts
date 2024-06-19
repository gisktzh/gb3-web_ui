/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';

import {Gb3GeoshopProductsService} from './gb3-geoshop-products.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {of} from 'rxjs';
import {ConfigService} from '../../config.service';
import {Product} from '../../../interfaces/gb3-geoshop-product.interface';
import {DataDownloadFilter} from '../../../interfaces/data-download-filter.interface';
import {ProductAvailability} from '../../../enums/product-availability.enum';
import {provideMockStore} from '@ngrx/store/testing';

describe('Gb3GeoshopProductsService', () => {
  let service: Gb3GeoshopProductsService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideMockStore()],
    });
    service = TestBed.inject(Gb3GeoshopProductsService);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProductList', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        timestamp: '2023-11-25T12:51:39.368373',
        products: [
          {
            geolion_geodatensatz_uuid: '3f0176ec-f9ff-45cd-9fa3-803e76a19743',
            id: '536-1',
            giszhnr: 536,
            ogd: true,
            name: 'AV Gewässer (OGD)',
            keywords: ['Gewässer', 'Fliessgewässer', 'Stehgewässer', 'AV', 'Amtliche Vermessung', 'Gewässernummer', 'Gewässername'],
            themes: ['Gewässer', 'Amtliche Vermessung (AV)', 'Grundstückskataster'],
            formats: [
              {
                id: 1,
                description: 'Comma separated text (.csv)',
                mb_per_km2_med: 0.001,
                is_fixed_size: false,
              },
              {
                id: 3,
                description: 'ESRI Shapefile (.shp)',
                mb_per_km2_med: 0.017,
                is_fixed_size: false,
              },
              {
                id: 25,
                description: 'DXF (.dxf)',
                mb_per_km2_med: 0.699,
                is_fixed_size: false,
              },
              {
                id: 101,
                description: 'ESRI File Geodatabase (.gdb)',
                mb_per_km2_med: 0.005,
                is_fixed_size: false,
              },
              {
                id: 128,
                description: 'GeoPackage (.gpkg)',
                mb_per_km2_med: 0.008,
                is_fixed_size: false,
              },
            ],
            url: null,
          },
          {
            geolion_geodatensatz_uuid: '3b8b3199-0bce-4dbb-a584-c5043e890ba3',
            id: '11-2',
            giszhnr: 11,
            ogd: false,
            name: 'Abwasser',
            keywords: [
              'Abwasser',
              'Abwasserrecht',
              'Abwasserreinigungsanlage',
              'Drainage',
              'Einleitung',
              'Einzugsgebiet',
              'Entwässerungssystem',
              'Genereller Entwässerungsplan (GEP)',
              'Kanal',
              'Kanalisation',
              'Kanalnetz',
              'Kläranlage',
              'Kleinkläranlage (KLARA)',
              'Leitung',
              'Sonderbauwerk',
              'Versickerung',
            ],
            themes: ['Umweltschutz', 'Lärm', 'Gewässer', 'Wasser- und Abfallsysteme'],
            formats: [
              {
                id: 3,
                description: 'ESRI Shapefile (.shp)',
                mb_per_km2_med: null,
                is_fixed_size: null,
              },
            ],
            url: 'https://geodatenshop.zh.ch/geodatenshop/neue-bestellung',
          },
        ],
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: Product[] = [
        {
          id: '536-1',
          gisZHNr: 536,
          ogd: true,
          name: 'AV Gewässer (OGD)',
          keywords: ['Gewässer', 'Fliessgewässer', 'Stehgewässer', 'AV', 'Amtliche Vermessung', 'Gewässernummer', 'Gewässername'],
          themes: ['Gewässer', 'Amtliche Vermessung (AV)', 'Grundstückskataster'],
          formats: [
            {
              id: 1,
              description: 'Comma separated text (.csv)',
            },
            {
              id: 3,
              description: 'ESRI Shapefile (.shp)',
            },
            {
              id: 25,
              description: 'DXF (.dxf)',
            },
            {
              id: 101,
              description: 'ESRI File Geodatabase (.gdb)',
            },
            {
              id: 128,
              description: 'GeoPackage (.gpkg)',
            },
          ],
          geolionGeodatensatzUuid: '3f0176ec-f9ff-45cd-9fa3-803e76a19743',
          nonOgdProductUrl: undefined,
        },
        {
          id: '11-2',
          gisZHNr: 11,
          ogd: false,
          name: 'Abwasser',
          keywords: [
            'Abwasser',
            'Abwasserrecht',
            'Abwasserreinigungsanlage',
            'Drainage',
            'Einleitung',
            'Einzugsgebiet',
            'Entwässerungssystem',
            'Genereller Entwässerungsplan (GEP)',
            'Kanal',
            'Kanalisation',
            'Kanalnetz',
            'Kläranlage',
            'Kleinkläranlage (KLARA)',
            'Leitung',
            'Sonderbauwerk',
            'Versickerung',
          ],
          themes: ['Umweltschutz', 'Lärm', 'Gewässer', 'Wasser- und Abfallsysteme'],
          formats: [
            {
              id: 3,
              description: 'ESRI Shapefile (.shp)',
            },
          ],
          geolionGeodatensatzUuid: '3b8b3199-0bce-4dbb-a584-c5043e890ba3',
          nonOgdProductUrl: 'https://geodatenshop.zh.ch/geodatenshop/neue-bestellung',
        },
      ];

      service.loadProducts().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/products`,
        );
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('loadRelevanteProducts', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        timestamp: '2023-11-27T08:45:16.357507',
        products: ['10018-1', '10017-1', '10016-1'],
      };
      const topicGuids = ['01560dfb-1e84-423e-ace9-478848c55132', '26d7c027-38f2-42cb-a17a-99f17a2e383e'];
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: string[] = ['10018-1', '10017-1', '10016-1'];

      service.loadRelevanteProducts(topicGuids).subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledTimes(1);
        expect(actual).toEqual(expected);
        done();
      });
    });

    it('should return an empty result array and not send any search requests for empty search terms', (done: DoneFn) => {
      const httpTestingController = TestBed.inject(HttpTestingController);
      const topicGuids: string[] = [];

      const expected: string[] = [];

      service.loadRelevanteProducts(topicGuids).subscribe((actual) => {
        httpTestingController.expectNone((req: HttpRequest<unknown>) =>
          req.url.includes(`${configService.apiConfig.gb2Api.baseUrl}/products/relevant`),
        );
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('extractProductFilterValues', () => {
    it('should extract ', () => {
      const products: Product[] = [
        {
          id: '112',
          ogd: true,
          themes: ['Elements', 'Bender', 'Male'],
          gisZHNr: 1337,
          keywords: ['Avatar', 'Master of four elements', 'Airbender'],
          nonOgdProductUrl: undefined,
          geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
          name: 'Aang',
          formats: [
            {
              id: 1,
              description: 'Water (.nas)',
            },
            {
              id: 2,
              description: 'Earth (.erd)',
            },
            {
              id: 3,
              description: 'Fire (.hot)',
            },
            {
              id: 4,
              description: 'Air (.air)',
            },
          ],
        },
        {
          id: '14',
          ogd: false,
          themes: ['Elements', 'Bender', 'Female'],
          gisZHNr: 1337,
          keywords: ['Waterbender'],
          nonOgdProductUrl: 'www.example.com',
          geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
          name: 'Katara',
          formats: [
            {
              id: 1,
              description: 'Water (.nas)',
            },
          ],
        },
        {
          id: '16',
          ogd: false,
          themes: ['Elements', 'Bender', 'Male', 'Honor'],
          gisZHNr: 1337,
          keywords: ['Firebender', 'Prince'],
          nonOgdProductUrl: 'www.example.com',
          geolionGeodatensatzUuid: 'abcd-efgh-ijkl-mnop',
          name: 'Zuko',
          formats: [
            {
              id: 3,
              description: 'Only Fire (.hot)',
            },
          ],
        },
      ];

      const expected: DataDownloadFilter[] = [
        {
          category: 'availability',
          label: 'Verfügbarkeit',
          filterValues: [
            {value: ProductAvailability.Ogd, isActive: false},
            {value: ProductAvailability.Nogd, isActive: false},
          ],
        },
        {
          category: 'format',
          label: 'Dateiformate',
          filterValues: [
            {value: 'Water (.nas)', isActive: false},
            {value: 'Earth (.erd)', isActive: false},
            {value: 'Fire (.hot)', isActive: false},
            {value: 'Air (.air)', isActive: false},
            {value: 'Only Fire (.hot)', isActive: false},
          ],
        },
        {
          category: 'theme',
          label: 'Themen',
          filterValues: [
            {value: 'Elements', isActive: false},
            {value: 'Bender', isActive: false},
            {value: 'Male', isActive: false},
            {value: 'Female', isActive: false},
            {value: 'Honor', isActive: false},
          ],
        },
      ];
      const actual = service.extractProductFilterValues(products);
      expect(actual).toEqual(expected);
    });
  });
});
