/* eslint-disable @typescript-eslint/naming-convention */
import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {GravCmsService} from './grav-cms.service';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {DiscoverMapsItem} from '../../../interfaces/discover-maps-item.interface';
import {ConfigService} from '../../config.service';
import {PageNotification} from '../../../interfaces/page-notification.interface';
import {MainPage} from '../../../enums/main-page.enum';
import {FrequentlyUsedItem} from '../../../interfaces/frequently-used-item.interface';
import {provideMockStore} from '@ngrx/store/testing';
import {TIME_SERVICE} from '../../../../app.module';
import {DayjsTimeService} from '../../dayjs-time.service';

describe('GravCmsService', () => {
  let service: GravCmsService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: TIME_SERVICE, useClass: DayjsTimeService},
      ],
    });
    service = TestBed.inject(GravCmsService);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDiscoverMapsData', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        'discover-maps': [
          {
            image: {
              name: 'ruvsmjzmt6ienof.png',
              type: 'image/png',
              size: 662482,
              path: 'assets/uploads/discovermaps/ruvsmjzmt6ienof.png',
            },
            title: 'Linien des \u00f6ffentlichen Verkehrs',
            description:
              'Die Karte \u00abLinien des \u00f6ffentlichen Verkehrs\u00bb zeigt s\u00e4mtliche S-Bahn-, Bus-, Tram- und Bergbahnlinien im Gebiet des Z\u00fcrcher Verkehrsverbunds.',
            id: 'ZvvLinienZH',
            from_date: '18.09.2023',
            to_date: '18.09.2099',
            flex_id: '834edbc84de8f23787af85ddd8c06132',
          },
          {
            title: 'Landschaftstypologie',
            description:
              'Darstellung der fl\u00e4chendeckenden Landschaftstypologie des Kantons Z\u00fcrich in Anlehnung an die Landschaftstypologie Schweiz.',
            id: 'ARELandschaftstypologieZH',
            from_date: '18.09.2023',
            to_date: '18.09.2099',
            image: {
              name: 'c8xtlxyksm9w5tj.png',
              type: 'image/png',
              size: 542427,
              path: 'assets/uploads/discovermaps/c8xtlxyksm9w5tj.png',
            },
            image_alt: 'Bildbeschriftung für Landschaftstypologie',
            flex_id: 'da0a66b63d2b036dd6d0ad6b470d1a2c',
          },
        ],
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: DiscoverMapsItem[] = [
        {
          id: '834edbc84de8f23787af85ddd8c06132',
          title: 'Linien des \u00f6ffentlichen Verkehrs',
          description:
            'Die Karte \u00abLinien des \u00f6ffentlichen Verkehrs\u00bb zeigt s\u00e4mtliche S-Bahn-, Bus-, Tram- und Bergbahnlinien im Gebiet des Z\u00fcrcher Verkehrsverbunds.',
          mapId: 'ZvvLinienZH',
          fromDate: new Date(2023, 8, 18),
          toDate: new Date(2099, 8, 18),
          image: {
            url: `${configService.apiConfig.gravCms.baseUrl}/assets/uploads/discovermaps/ruvsmjzmt6ienof.png`,
            name: 'ruvsmjzmt6ienof.png',
            type: 'image/png',
            size: 662482,
            path: 'assets/uploads/discovermaps/ruvsmjzmt6ienof.png',
            altText: undefined,
          },
        },
        {
          id: 'da0a66b63d2b036dd6d0ad6b470d1a2c',
          title: 'Landschaftstypologie',
          description:
            'Darstellung der fl\u00e4chendeckenden Landschaftstypologie des Kantons Z\u00fcrich in Anlehnung an die Landschaftstypologie Schweiz.',
          mapId: 'ARELandschaftstypologieZH',
          fromDate: new Date(2023, 8, 18),
          toDate: new Date(2099, 8, 18),
          image: {
            url: `${configService.apiConfig.gravCms.baseUrl}/assets/uploads/discovermaps/c8xtlxyksm9w5tj.png`,
            name: 'c8xtlxyksm9w5tj.png',
            type: 'image/png',
            size: 542427,
            path: 'assets/uploads/discovermaps/c8xtlxyksm9w5tj.png',
            altText: 'Bildbeschriftung für Landschaftstypologie',
          },
        },
      ];

      service.loadDiscoverMapsData().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.gravCms.baseUrl}/discovermaps.json`);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('loadPageInfosData', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        'page-infos': [
          {
            title: 'Vorabversion (Betaversion) GIS-Browser Kanton Z\u00fcrich',
            description:
              'Der GIS-Browser ist noch in der Entwicklung, der Funktions- und Kartenumfang ist teilweise noch eingeschr\u00e4nkt.',
            severity: 'info',
            pages: {
              start: true,
              datacatalogue: true,
              support: true,
              map: false,
            },
            from_date: '18.09.2023',
            to_date: '18.09.2099',
            flex_id: '638779f9430a8dca3cd1a1659a4f6159',
          },
        ],
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: PageNotification[] = [
        {
          id: '638779f9430a8dca3cd1a1659a4f6159',
          title: 'Vorabversion (Betaversion) GIS-Browser Kanton Z\u00fcrich',
          description:
            'Der GIS-Browser ist noch in der Entwicklung, der Funktions- und Kartenumfang ist teilweise noch eingeschr\u00e4nkt.',
          pages: [MainPage.Start, MainPage.Data, MainPage.Support],
          fromDate: new Date(2023, 8, 18),
          toDate: new Date(2099, 8, 18),
          severity: 'info',
          isMarkedAsRead: false,
        },
      ];

      service.loadPageInfosData().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.gravCms.baseUrl}/pageinfos.json`);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });

  describe('loadFrequentlyUsedData', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        'frequently-used': [
          {
            title: 'Orthofotos',
            description: 'Entzerrte und georeferenzierte digitale Luftaufnahmen des Kantons Z\u00fcrich.',
            url: '/maps?initialMapIds=OrthoZH',
            created: '1695029071',
            image: {
              name: 'mdph1k0nyqstliu.png',
              type: 'image/png',
              size: 2361401,
              path: 'assets/uploads/frequentlyused/mdph1k0nyqstliu.png',
            },
            image_alt: 'Bildbeschriftung für Orthofotos',
            flex_id: 'b07395a55bd971a90884aff2e8bb7abf',
          },
          {
            title: 'Amtliche Vermessung',
            description:
              'Die Daten der amtlichen Vermessung (AV) dokumentieren laufend das aktuelle Grundeigentum. Neben den Grundst\u00fccksgrenzen enthalten diese auch Geb\u00e4udestandorte, Gew\u00e4sserl\u00e4ufe oder Waldr\u00e4nder.',
            url: '/maps?initialMapIds=AVfarbigZH',
            created: '1695028982',
            image: {
              name: 'czef0j9wrdgbyni.png',
              type: 'image/png',
              size: 506099,
              path: 'assets/uploads/frequentlyused/czef0j9wrdgbyni.png',
            },
            flex_id: 'dc10938d401e622da75cbcfdcebf64d5',
          },
          {
            title: 'Azeroth',
            description:
              'Eine gefährliche, schöne, magische und inspirierende Welt. Eine Welt voller Entdeckungen, Innovationen und Wunder. Eine Welt, für die es sich zu kämpfen lohnt. Eine Welt, die es wert ist, beschützt zu werden.',
            url: '/maps?initialMapIds=F0r7H3H0rD3',
            created: '1424201337',
            image: null,
            image_alt: 'Bildbeschriftung für Azeroth',
            flex_id: '00000000-0000-4000-y000-000000000000',
          },
        ],
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: FrequentlyUsedItem[] = [
        {
          id: 'b07395a55bd971a90884aff2e8bb7abf',
          title: 'Orthofotos',
          description: 'Entzerrte und georeferenzierte digitale Luftaufnahmen des Kantons Z\u00fcrich.',
          url: '/maps?initialMapIds=OrthoZH',
          image: {
            url: `${configService.apiConfig.gravCms.baseUrl}/assets/uploads/frequentlyused/mdph1k0nyqstliu.png`,
            name: 'mdph1k0nyqstliu.png',
            type: 'image/png',
            size: 2361401,
            path: 'assets/uploads/frequentlyused/mdph1k0nyqstliu.png',
            altText: 'Bildbeschriftung für Orthofotos',
          },
          created: new Date(Date.UTC(2023, 8, 18, 9, 24, 31)),
        },
        {
          id: 'dc10938d401e622da75cbcfdcebf64d5',
          title: 'Amtliche Vermessung',
          description:
            'Die Daten der amtlichen Vermessung (AV) dokumentieren laufend das aktuelle Grundeigentum. Neben den Grundst\u00fccksgrenzen enthalten diese auch Geb\u00e4udestandorte, Gew\u00e4sserl\u00e4ufe oder Waldr\u00e4nder.',
          url: '/maps?initialMapIds=AVfarbigZH',
          image: {
            url: `${configService.apiConfig.gravCms.baseUrl}/assets/uploads/frequentlyused/czef0j9wrdgbyni.png`,
            name: 'czef0j9wrdgbyni.png',
            type: 'image/png',
            size: 506099,
            path: 'assets/uploads/frequentlyused/czef0j9wrdgbyni.png',
            altText: undefined,
          },
          created: new Date(Date.UTC(2023, 8, 18, 9, 23, 2)),
        },
        {
          id: '00000000-0000-4000-y000-000000000000',
          title: 'Azeroth',
          description:
            'Eine gefährliche, schöne, magische und inspirierende Welt. Eine Welt voller Entdeckungen, Innovationen und Wunder. Eine Welt, für die es sich zu kämpfen lohnt. Eine Welt, die es wert ist, beschützt zu werden.',
          url: '/maps?initialMapIds=F0r7H3H0rD3',
          image: undefined,
          created: new Date(Date.UTC(2015, 1, 17, 19, 28, 57)),
        },
      ];

      service.loadFrequentlyUsedData().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(`${configService.apiConfig.gravCms.baseUrl}/frequentlyused.json`);
        expect(actual).toEqual(expected);
        done();
      });
    });
  });
});
