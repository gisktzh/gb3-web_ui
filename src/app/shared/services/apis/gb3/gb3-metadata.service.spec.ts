import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {Gb3MetadataService} from './gb3-metadata.service';
import {
  MetadataDatasetsDetailData,
  MetadataMapsDetailData,
  MetadataProductsDetailData,
  MetadataServicesDetailData,
} from '../../../models/gb3-api-generated.interfaces';
import {ConfigService} from '../../config.service';
import {DepartmentalContact, ServiceMetadata} from '../../../interfaces/gb3-metadata.interface';

const mockServiceDetailResponse = {
  service: {
    url: 'https://www.example.com/service',
    guid: 1337,
    datasets: [
      {name: 'data-1', guid: 1, kurzbeschreibung: 'Lorem ipsum dolor'},
      {name: 'data-2', guid: 2, kurzbeschreibung: 'Lorem ipsum dolor'},
    ],
    name: 'test-service',
    beschreibung: 'Lorem ipsum dolor',
    image_url: 'https://www.example.com/picture.png',
    kontakt: {metadaten: {amt: 'A', email: 'a@b.com', fachstelle: 'c'}},
    servicetyp: 'type of service',
    version: '1.0.1b',
    zugang: 'No access',
  },
} as MetadataServicesDetailData;

const mockMapDetailResponse = {
  map: {
    guid: 131,
    datasets: [
      {name: 'data-1', guid: 1, kurzbeschreibung: 'Lorem ipsum dolor'},
      {name: 'data-2', guid: 2, kurzbeschreibung: 'Lorem ipsum dolor'},
    ],
    beschreibung: 'Lorem ipsum dolor',
    image_url: 'https://www.example.com/picture.png',
    kontakt: {geodaten: {amt: 'A', email: 'a@b.com', fachstelle: 'c'}},
    name: 'Testmap',
    topic: 'test-topic',
  },
} as MetadataMapsDetailData;

const mockProductDetailResponse = {
  product: {
    guid: 131,
    datasets: [
      {name: 'data-1', guid: 1, kurzbeschreibung: 'Lorem ipsum dolor'},
      {name: 'data-2', guid: 2, kurzbeschreibung: 'Lorem ipsum dolor'},
    ],
    beschreibung: 'Lorem ipsum dolor',
    image_url: 'https://www.example.com/picture.png',
    kontakt: {metadaten: {amt: 'A', email: 'a@b.com', fachstelle: 'c'}},
    name: 'Testmap',
  },
} as MetadataProductsDetailData;

const mockDatasetDetailResponse = {
  dataset: {
    guid: 131,
    beschreibung: 'Lorem ipsum dolor',
    image_url: 'https://www.example.com/picture.png',
    kontakt: {
      metadaten: {
        amt: 'A',
        email: 'a@b.com',
        fachstelle: 'c',
        plz: 1234,
        hausnummer: 3,
        nachname: 'Test',
        ortschaft: 'Testhausen',
        postfach: null,
        sektion: null,
        strassenname: 'Testweg',
        telephon: '1234',
        telephon_direkt: '12345',
        weburl: 'https://www.example.com',
        vorname: 'Tester',
      },
      geodaten: {
        amt: 'A',
        email: 'a@b.com',
        fachstelle: 'c',
        plz: 1234,
        hausnummer: 3,
        nachname: 'Test',
        ortschaft: 'Testhausen',
        postfach: null,
        sektion: null,
        strassenname: 'Testweg',
        telephon: '1234',
        telephon_direkt: '12345',
        weburl: 'https://www.example.com',
        vorname: 'Tester',
      },
    },
    name: 'Testmap',
    layers: [],
    maps: [],
    products: [],
    services: [],
    kurzbeschreibung: 'Lorem Ipsum',
    abgabeformat: 'PDF',
    anwendungeinschraenkung: 'keine',
    themen: null,
    keywords: null,
    bemerkungen: null,
    datengrundlage: null,
    pdf_name: null,
    pdf_url: null,
  },
} as MetadataDatasetsDetailData;

describe('Gb3MetadataService', () => {
  let service: Gb3MetadataService;
  let configService: ConfigService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Gb3MetadataService);
    configService = TestBed.inject(ConfigService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('services', () => {
    it('creates correct url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockServiceDetailResponse));

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/metadata/services/${testId}`;

      service.loadServiceDetail(testId).subscribe(() => {
        expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
        done();
      });
    });

    xit('maps the response correctly', (done: DoneFn) => {
      // todo: issue with our spread usage
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockServiceDetailResponse));

      const expected: ServiceMetadata = {
        version: mockServiceDetailResponse.service.version,
        url: mockServiceDetailResponse.service.url,
        imageUrl: mockServiceDetailResponse.service.image_url,
        guid: mockServiceDetailResponse.service.guid,
        name: mockServiceDetailResponse.service.name,
        access: mockServiceDetailResponse.service.zugang,
        serviceType: mockServiceDetailResponse.service.servicetyp,
        description: mockServiceDetailResponse.service.beschreibung,
        contact: {metadata: {} as DepartmentalContact},
        datasets: mockServiceDetailResponse.service.datasets.map(({name, guid, kurzbeschreibung}) => ({
          guid,
          name,
          shortDescription: kurzbeschreibung,
        })),
      };

      service.loadServiceDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
        done();
      });
    });
  });

  describe('maps', () => {
    it('creates correct url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockMapDetailResponse));

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/metadata/maps/${testId}`;

      service.loadMapDetail(testId).subscribe(() => {
        expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
        done();
      });
    });
  });

  describe('products', () => {
    it('creates correct url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockProductDetailResponse));

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/metadata/products/${testId}`;

      service.loadProductDetail(testId).subscribe(() => {
        expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
        done();
      });
    });
  });

  describe('datasets', () => {
    it('creates correct url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockDatasetDetailResponse));

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/metadata/datasets/${testId}`;

      service.loadDatasetDetail(testId).subscribe(() => {
        expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
        done();
      });
    });
  });

  describe('load all', () => {
    it('calls all 4 overview endpoints and groups the result', (done: DoneFn) => {
      const httpTestingController = TestBed.inject(HttpTestingController);

      service
        .loadFullList()
        .pipe()
        .subscribe((result) => {
          httpTestingController.verify();

          expect(result).toEqual([[], [], [], []]);
          done();
        });

      const datasetsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/datasets`);
      datasetsRequest.flush({datasets: []});
      const mapsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/maps`);
      mapsRequest.flush({maps: []});
      const productsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/products`);
      productsRequest.flush({products: []});
      const servicesRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/services`);
      servicesRequest.flush({services: []});
    });
  });
});
