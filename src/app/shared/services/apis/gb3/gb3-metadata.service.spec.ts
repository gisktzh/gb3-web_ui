/* eslint-disable @typescript-eslint/naming-convention */

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
import {
  DatasetMetadata,
  DepartmentalContact,
  MapMetadata,
  ProductMetadata,
  ServiceMetadata,
} from '../../../interfaces/gb3-metadata.interface';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../../../models/overview-metadata-item.model';

const mockContact = {
  amt: 'Amt für Tests',
  email: 'amt-fuer-tests@example.com',
  fachstelle: 'Fachstelle für Unittests',
  plz: 1234,
  hausnummer: 3,
  nachname: 'von Testberg',
  ortschaft: 'Testhausen',
  postfach: 'PO123',
  sektion: 'Sektion für Mocks',
  strassenname: 'Testweg',
  telephon: '1234',
  telephon_direkt: '12345',
  weburl: 'https://www.example.com',
  vorname: 'Testbaron',
};

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
    kontakt: {
      metadaten: {...mockContact},
    },
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
    kontakt: {geodaten: {...mockContact}},
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
    kontakt: {metadaten: {...mockContact}},
    name: 'Testmap',
  },
} as MetadataProductsDetailData;

const mockDatasetDetailResponse = {
  dataset: {
    guid: 131,
    beschreibung: 'Lorem ipsum dolor',
    image_url: 'https://www.example.com/picture.png',
    kontakt: {
      metadaten: {...mockContact},
      geodaten: {...mockContact},
    },
    name: 'Testmap',
    layers: [],
    maps: [{name: 'test', guid: 123, topic: 'TopicTest'}],
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

const expectedMockDepartmentalContact: DepartmentalContact = {
  url: mockContact.weburl,
  email: mockContact.email,
  phoneDirect: mockContact.telephon_direkt,
  phone: mockContact.telephon,
  poBox: mockContact.postfach,
  houseNumber: mockContact.hausnummer,
  firstName: mockContact.vorname,
  lastName: mockContact.nachname,
  zipCode: mockContact.plz,
  street: mockContact.strassenname,
  village: mockContact.ortschaft,
  department: mockContact.amt,
  section: mockContact.sektion,
  division: mockContact.fachstelle,
};

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

    it('maps the response correctly', (done: DoneFn) => {
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
        contact: {
          metadata: expectedMockDepartmentalContact,
        },
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

    it('maps the response correctly', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockMapDetailResponse));

      const expected: MapMetadata = {
        topic: mockMapDetailResponse.map.topic,
        imageUrl: mockMapDetailResponse.map.image_url,
        guid: mockMapDetailResponse.map.guid,
        name: mockMapDetailResponse.map.name,
        description: mockMapDetailResponse.map.beschreibung,
        contact: {
          geodata: expectedMockDepartmentalContact,
        },
        datasets: mockMapDetailResponse.map.datasets.map(({name, guid, kurzbeschreibung}) => ({
          guid,
          name,
          shortDescription: kurzbeschreibung,
        })),
      };

      service.loadMapDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
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

    it('maps the response correctly', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockProductDetailResponse));

      const expected: ProductMetadata = {
        imageUrl: mockProductDetailResponse.product.image_url,
        guid: mockProductDetailResponse.product.guid,
        name: mockProductDetailResponse.product.name,
        description: mockProductDetailResponse.product.beschreibung,
        contact: {
          metadata: expectedMockDepartmentalContact,
        },
        datasets: mockProductDetailResponse.product.datasets.map(({name, guid, kurzbeschreibung}) => ({
          guid,
          name,
          shortDescription: kurzbeschreibung,
        })),
      };

      service.loadProductDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
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

    it('maps the response correctly', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockDatasetDetailResponse));

      const expected: DatasetMetadata = {
        keywords: mockDatasetDetailResponse.dataset.keywords,
        topics: mockDatasetDetailResponse.dataset.themen,
        layers: mockDatasetDetailResponse.dataset.layers.map((layer) => ({
          guid: layer.guid,
          name: layer.name,
          dataProcurementType: layer.datenbezugart,
          description: layer.beschreibung,
          metadataVisibility: layer.metadaten_sichtbarkeit,
        })),
        dataBasis: mockDatasetDetailResponse.dataset.datengrundlage,
        remarks: mockDatasetDetailResponse.dataset.bemerkungen,
        pdfUrl: mockDatasetDetailResponse.dataset.pdf_url,
        pdfName: mockDatasetDetailResponse.dataset.pdf_name,
        outputFormat: mockDatasetDetailResponse.dataset.abgabeformat,
        usageRestrictions: mockDatasetDetailResponse.dataset.anwendungeinschraenkung,
        shortDescription: mockDatasetDetailResponse.dataset.kurzbeschreibung,
        imageUrl: mockDatasetDetailResponse.dataset.image_url,
        guid: mockDatasetDetailResponse.dataset.guid,
        name: mockDatasetDetailResponse.dataset.name,
        description: mockDatasetDetailResponse.dataset.beschreibung,
        contact: {
          metadata: expectedMockDepartmentalContact,
          geodata: expectedMockDepartmentalContact,
        },
        maps: mockDatasetDetailResponse.dataset.maps.map(({name, guid, topic}) => ({name, guid, topic})),
        products: mockDatasetDetailResponse.dataset.products.map(({name, guid}) => ({name, guid})),
        services: mockDatasetDetailResponse.dataset.services.map(({name, guid, servicetyp}) => ({name, guid, serviceType: servicetyp})),
      };

      service.loadDatasetDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
        done();
      });
    });
  });

  describe('load all', () => {
    it('calls all 4 overview endpoints once and groups the result into a flat map', (done: DoneFn) => {
      const httpTestingController = TestBed.inject(HttpTestingController);

      service
        .loadFullList()
        .pipe()
        .subscribe((result) => {
          const expected: OverviewMetadataItem[] = [
            new ServiceOverviewMetadataItem(
              mockServiceDetailResponse.service.guid,
              mockServiceDetailResponse.service.name,
              mockServiceDetailResponse.service.beschreibung,
              mockServiceDetailResponse.service.kontakt.metadaten.amt,
            ),
            new MapOverviewMetadataItem(
              mockMapDetailResponse.map.guid,
              mockMapDetailResponse.map.name,
              mockMapDetailResponse.map.beschreibung,
              mockMapDetailResponse.map.kontakt.geodaten.amt,
            ),
            new ProductOverviewMetadataItem(
              mockProductDetailResponse.product.guid,
              mockProductDetailResponse.product.name,
              mockProductDetailResponse.product.beschreibung,
              mockProductDetailResponse.product.kontakt.metadaten.amt,
            ),
            new DatasetOverviewMetadataItem(
              mockDatasetDetailResponse.dataset.guid,
              mockDatasetDetailResponse.dataset.name,
              mockDatasetDetailResponse.dataset.beschreibung,
              mockDatasetDetailResponse.dataset.kontakt.metadaten.amt,
              mockDatasetDetailResponse.dataset.abgabeformat,
            ),
          ];
          httpTestingController.verify();
          expect(result).toEqual(jasmine.arrayWithExactContents(expected));
          done();
        });

      const datasetsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/datasets`);
      datasetsRequest.flush({datasets: [mockDatasetDetailResponse.dataset]});
      const mapsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/maps`);
      mapsRequest.flush({maps: [mockMapDetailResponse.map]});
      const productsRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/products`);
      productsRequest.flush({products: [mockProductDetailResponse.product]});
      const servicesRequest = httpTestingController.expectOne(`${configService.apiConfig.gb2Api.baseUrl}/metadata/services`);
      servicesRequest.flush({services: [mockServiceDetailResponse.service]});
    });
  });
});
