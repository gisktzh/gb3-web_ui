/* eslint-disable @typescript-eslint/naming-convention */
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {Gb3OerebExtractService} from './gb3-oereb-extract.service';
import {ConfigService} from '../../config.service';
import {OerebConcernedTheme, OerebExtractResponse, OerebNotConcernedTheme} from '../../../interfaces/oereb-extract.interface';
import {
  NotConcernedTheme as OerebAPINotConcernedTheme,
  OerebFeature as OerebAPIFeature,
} from '../../../models/gb3-api-generated.interfaces';

describe('Gb3OerebExtractService', () => {
  let service: Gb3OerebExtractService;
  let configService: ConfigService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });

    service = TestBed.inject(Gb3OerebExtractService);
    configService = TestBed.inject(ConfigService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadOerebExtract', () => {
    it('should return null when the API returns null', () => {
      const httpGetSpy = vi.spyOn(httpClient, 'get').mockReturnValue(of(null));

      const x = 2682707.901;
      const y = 1247901.659;

      service.loadOerebExtract(x, y).subscribe((actual) => {
        expect(httpGetSpy).toHaveBeenCalledTimes(1);
        expect(httpGetSpy).toHaveBeenCalledWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/oereb?x=${x}&y=${y}`,
        );
        expect(actual).toBeNull();
      });
    });

    it('should receive the data and transform it correctly', () => {
      const notConcernedTheme: OerebAPINotConcernedTheme = {
        id: 12,
        name: 'Not concerned theme',
        hints: [],
      };

      const notAvailableTheme: OerebAPINotConcernedTheme = {
        id: 13,
        name: 'Not available theme',
        hints: [],
      };

      const data: OerebAPIFeature = {
        oereb_info: {
          municipality_name: 'Zürich',
          municipality_code: 261,
          parcel_number: '1234',
          egrid: 'CH123456789012',
          kbo: {
            title: 'Kantonale Bodenübersicht',
            href: 'https://example.com/kbo',
          },
          surveyor: {
            title: 'Vermessungsamt',
            href: 'https://example.com/surveyor',
          },
          static_extract_url: 'https://example.com/extract.pdf',
          concerned_themes: [
            {
              id: 1,
              name: 'Raumplanung',
              restrictions: [
                {
                  id: 101,
                  name: 'Flächenbeschränkung',
                  illustration_url: {
                    src: {
                      href: 'https://example.com/area.png',
                    },
                    alt: '',
                    url: {
                      href: 'https://example.com/area.png',
                    },
                  },
                  measurement: {
                    area_m2: 1234.56,
                    percentage: 42.5,
                  },
                },
                {
                  id: 102,
                  name: 'Linienbeschränkung',
                  measurement: {
                    line_length: 987.65,
                  },
                },
                {
                  id: 103,
                  name: 'Punktbeschränkung',
                  illustration_url: {
                    src: {
                      href: 'https://example.com/points.png',
                    },
                    alt: '',
                    url: {
                      href: 'https://example.com/points.png',
                    },
                  },
                  measurement: {
                    points_count: 17,
                  },
                },
              ],
              legal_provisions: [
                {
                  title: 'Gesetzliche Bestimmung',
                  href: 'https://example.com/legal-provision',
                },
              ],
              laws: [
                {
                  title: 'Gesetz',
                  href: 'https://example.com/law',
                },
              ],
              hints: [
                {
                  title: 'Hinweis',
                  href: 'https://example.com/hint',
                },
              ],
              responsible_offices: [
                {
                  title: 'Zuständige Stelle',
                  href: 'https://example.com/office',
                },
              ],
            },
          ],
          not_concerned_themes: [notConcernedTheme],
          not_available_themes: [notAvailableTheme],
        },
      } as OerebAPIFeature;

      const httpGetSpy = vi.spyOn(httpClient, 'get').mockReturnValue(of(data));

      const x = 2682707.901;
      const y = 1247901.659;

      const expected: OerebExtractResponse = {
        municipalityName: 'Zürich',
        municipalityCode: 261,
        parcelNumber: '1234',
        egrid: 'CH123456789012',
        kbo: {
          title: 'Kantonale Bodenübersicht',
          href: 'https://example.com/kbo',
        },
        surveyor: {
          title: 'Vermessungsamt',
          href: 'https://example.com/surveyor',
        },
        staticExtractUrl: 'https://example.com/extract.pdf',
        concernedThemes: [
          {
            id: 1,
            name: 'Raumplanung',
            restrictions: [
              {
                id: 101,
                name: 'Flächenbeschränkung',
                illustration: {
                  src: {
                    href: 'https://example.com/area.png',
                  },
                  alt: '',
                  url: {
                    href: 'https://example.com/area.png',
                  },
                },
                measurement: {
                  areaM2: 1234.56,
                  percentage: 42.5,
                },
              },
              {
                id: 102,
                name: 'Linienbeschränkung',
                illustration: undefined,
                measurement: {
                  lineLength: 987.65,
                },
              },
              {
                id: 103,
                name: 'Punktbeschränkung',
                illustration: {
                  src: {
                    href: 'https://example.com/points.png',
                  },
                  alt: '',
                  url: {
                    href: 'https://example.com/points.png',
                  },
                },
                measurement: {
                  pointsCount: 17,
                },
              },
            ],
            legalProvisions: [
              {
                title: 'Gesetzliche Bestimmung',
                href: 'https://example.com/legal-provision',
              },
            ],
            laws: [
              {
                title: 'Gesetz',
                href: 'https://example.com/law',
              },
            ],
            hints: [
              {
                title: 'Hinweis',
                href: 'https://example.com/hint',
              },
            ],
            resonsibleOffices: [
              {
                title: 'Zuständige Stelle',
                href: 'https://example.com/office',
              },
            ],
          } satisfies OerebConcernedTheme,
        ],
        notConcernedThemes: [
          {
            ...notConcernedTheme,
          } satisfies OerebNotConcernedTheme,
        ],
        notAvailableThemes: [
          {
            ...notAvailableTheme,
          } satisfies OerebNotConcernedTheme,
        ],
      };

      service.loadOerebExtract(x, y).subscribe((actual) => {
        expect(httpGetSpy).toHaveBeenCalledTimes(1);
        expect(httpGetSpy).toHaveBeenCalledWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/oereb?x=${x}&y=${y}`,
        );
        expect(actual).toEqual(expected);
      });
    });

    it('should map a link without a title to an empty title', () => {
      const data: OerebAPIFeature = {
        oereb_info: {
          municipality_name: 'Zürich',
          municipality_code: 261,
          parcel_number: '1234',
          egrid: 'CH123456789012',
          kbo: {
            title: '',
            href: 'https://example.com/kbo',
          },
          surveyor: {
            title: '',
            href: 'https://example.com/surveyor',
          },
          static_extract_url: 'https://example.com/extract.pdf',
          concerned_themes: [],
          not_concerned_themes: [],
          not_available_themes: [],
        },
      } as OerebAPIFeature;

      vi.spyOn(httpClient, 'get').mockReturnValue(of(data));

      service.loadOerebExtract(1, 2).subscribe((actual) => {
        expect(actual?.kbo).toEqual({
          title: '',
          href: 'https://example.com/kbo',
        });

        expect(actual?.surveyor).toEqual({
          title: '',
          href: 'https://example.com/surveyor',
        });
      });
    });

    it('should map a missing link title to an empty title', () => {
      const data: OerebAPIFeature = {
        oereb_info: {
          municipality_name: 'Zürich',
          municipality_code: 261,
          parcel_number: '1234',
          egrid: 'CH123456789012',
          kbo: {
            href: 'https://example.com/kbo',
          },
          surveyor: {
            href: 'https://example.com/surveyor',
          },
          static_extract_url: 'https://example.com/extract.pdf',
          concerned_themes: [],
          not_concerned_themes: [],
          not_available_themes: [],
        },
      } as OerebAPIFeature;

      vi.spyOn(httpClient, 'get').mockReturnValue(of(data));

      service.loadOerebExtract(1, 2).subscribe((actual) => {
        expect(actual?.kbo).toEqual({
          title: '',
          href: 'https://example.com/kbo',
        });

        expect(actual?.surveyor).toEqual({
          title: '',
          href: 'https://example.com/surveyor',
        });
      });
    });
  });
});
