import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {Gb3ImportService} from './gb3-import.service';
import {ConfigService} from '../../config.service';
import {Gb3VectorLayer} from '../../../interfaces/gb3-vector-layer.interface';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';

describe('Gb3ImportService', () => {
  let service: Gb3ImportService;
  let configService: ConfigService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [],
    });

    service = TestBed.inject(Gb3ImportService);
    httpClient = TestBed.inject(HttpClient);
    configService = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should import drawing', (done: DoneFn) => {
    const mockFile = new File([''], 'filename', {type: 'text/plain'});
    const mockResponse: Gb3VectorLayer = {
      type: 'Vector',
      geojson: {type: 'FeatureCollection', features: []},
      styles: {},
    };
    const httpGetSpy = spyOn(httpClient, 'get').and.returnValue(of(mockResponse));
    const expectedUrl = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/import`;

    service.importDrawing(mockFile).subscribe((res) => {
      expect(httpGetSpy).toHaveBeenCalledOnceWith(expectedUrl);
      expect(res).toEqual(mockResponse);
      done();
    });
  });
});
