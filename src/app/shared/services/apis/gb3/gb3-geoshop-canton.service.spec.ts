import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {of} from 'rxjs';
import {ConfigService} from '../../config.service';
import {CantonWithGeometry} from '../../../interfaces/gb3-geoshop-product.interface';
import {Gb3GeoshopCantonService} from './gb3-geoshop-canton.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('Gb3GeoshopCantonService', () => {
  let service: Gb3GeoshopCantonService;
  let configService: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    });
    service = TestBed.inject(Gb3GeoshopCantonService);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadCanton', () => {
    it('should receive the data and transform it correctly', (done: DoneFn) => {
      const serverData = {
        boundingbox: {
          type: 'Polygon',
          coordinates: [
            [
              [2482000, 1072000],
              [2482000, 1298000],
              [2839000, 1298000],
              [2839000, 1072000],
              [2482000, 1072000],
            ],
          ],
        },
      };
      const httpClient = TestBed.inject(HttpClient);
      const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(serverData));

      const expected: CantonWithGeometry = {
        boundingBox: {
          type: 'Polygon',
          coordinates: [
            [
              [2482000, 1072000],
              [2482000, 1298000],
              [2839000, 1298000],
              [2839000, 1072000],
              [2482000, 1072000],
            ],
          ],
        },
      };

      service.loadCanton().subscribe((actual) => {
        expect(getCallSpy).toHaveBeenCalledOnceWith(
          `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/canton`,
        );
        expect(actual).toEqual(expected);
        done();
      });
    });
  });
});
