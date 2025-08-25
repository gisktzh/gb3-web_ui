import {GeoshopApiService} from '../../shared/services/apis/geoshop/services/geoshop-api.service';
import {DataDownloadOrderDownloadUrlPipe} from './data-download-order-download-url.pipe';
import {TestBed} from '@angular/core/testing';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('DataDownloadOrderDownloadUrlPipe', () => {
  let pipe: DataDownloadOrderDownloadUrlPipe;
  let geoshopApiService: GeoshopApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DataDownloadOrderDownloadUrlPipe,
        provideMockStore(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    geoshopApiService = TestBed.inject(GeoshopApiService);
    pipe = TestBed.inject(DataDownloadOrderDownloadUrlPipe);
  });

  it('should call the geoshopApiService and return the URL from this service', () => {
    const url = 'https://death.star';
    const geoshopApiServiceSpy = spyOn(geoshopApiService, 'createOrderDownloadUrl').and.returnValue(url);
    const orderId = 'ST-1337';

    const actual = pipe.transform(orderId);
    const expected = url;

    expect(geoshopApiServiceSpy).toHaveBeenCalledOnceWith(orderId);
    expect(actual).toBe(expected);
  });
});
