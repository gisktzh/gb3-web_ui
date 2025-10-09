/* eslint-disable @typescript-eslint/naming-convention */

import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
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
} from '../../../models/overview-search-result.model';
import {provideMockStore} from '@ngrx/store/testing';

const mockContact = {
  amt: 'Amt für Tests',
  email: {href: 'amt-fuer-tests@example.com'},
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
  weburl: {href: 'https://www.example.com'},
  vorname: 'Testbaron',
};

const mockServiceDetailResponse = {
  service: {
    url: {href: '/gb3/example/picture.png'},
    uuid: '1337',
    gdsernummer: 12,
    datasets: [
      {name: 'data-1', uuid: '1', kurzbeschreibung: 'Lorem ipsum dolor', giszhnr: 1},
      {name: 'data-2', uuid: '2', kurzbeschreibung: 'Lorem ipsum dolor', giszhnr: 2},
    ],
    name: 'test-service',
    beschreibung: 'Lorem ipsum dolor',
    image_url: {url: {href: '/gb3/example/picture.png'}, src: {href: '/gb3/example/picture.png'}, alt: 'Testbild'},
    kontakt_metadaten: {...mockContact},
    servicetyp: 'type of service',
    version: '1.0.1b',
    zugang: 'No access',
  },
} as MetadataServicesDetailData;

const mockMapDetailResponse = {
  map: {
    uuid: '131',
    gb2_id: 12,
    datasets: [
      {name: 'data-1', uuid: '1', kurzbeschreibung: 'Lorem ipsum dolor', url_shop: null, giszhnr: 1},
      {name: 'data-2', uuid: '2', kurzbeschreibung: 'Lorem ipsum dolor', url_shop: null, giszhnr: 2},
    ],
    beschreibung: 'Lorem ipsum dolor',
    image_url: {url: {href: '/gb3/example/picture.png'}, src: {href: '/gb3/example/picture.png'}, alt: 'Testbild'},
    kontakt_metadaten: {...mockContact},
    name: 'Testmap',
    topic: 'test-topic',
    verweise: [],
    gb2_url: null,
    gbkarten_internet_url: null,
    gbkarten_intranet_url: null,
  },
} as MetadataMapsDetailData;

const mockProductDetailResponse = {
  product: {
    uuid: '131',
    gdpnummer: 12,
    datasets: [
      {name: 'data-1', uuid: '1', kurzbeschreibung: 'Lorem ipsum dolor', giszhnr: 1},
      {name: 'data-2', uuid: '2', kurzbeschreibung: 'Lorem ipsum dolor', giszhnr: 1},
    ],
    beschreibung: 'Lorem ipsum dolor',
    image_url: {url: {href: '/gb3/example/picture.png'}, src: {href: '/gb3/example/picture.png'}, alt: 'Testbild'},
    kontakt_metadaten: {...mockContact},
    name: 'Testmap',
  },
} as MetadataProductsDetailData;

const mockDatasetDetailResponse = {
  dataset: {
    uuid: '131',
    gisZHNr: 12,
    beschreibung: 'Lorem ipsum dolor',
    image_url: {url: {href: '/gb3/example/picture.png'}, src: {href: '/gb3/example/picture.png'}, alt: 'Testbild'},
    kontakt_geodaten: {...mockContact},
    kontakt_metadaten: {...mockContact},
    name: 'Testmap',
    layers: [
      {
        name: 'layer1',
        giszhnr: '1',
        beschreibung: 'keine',
        geometrietyp: 'Points',
        pfadfilename: null,
        metadaten_sichtbarkeit: 'keine',
        datenbezugart: 'keine',
        attribute: [{name: 'attribut1', typ: 'attribut', einheit: 'm', beschreibung: 'keine'}],
      },
    ],
    maps: [{name: 'test', uuid: '123', topic: 'TopicTest', gb2_id: 1}],
    products: [],
    services: [],
    kurzbeschreibung: 'Lorem Ipsum',
    abgabeformate: ['PDF'],
    anwendungeinschraenkung: 'keine',
    themen: [],
    keywords: null,
    bemerkungen: null,
    datengrundlage: null,
    pdf_name: null,
    pdf_url: null,
    giszhnr: 5,
    url_shop: null,
    ogd: false,
    datenstand: null,
    nachfuehrungstyp: null,
    geogausdehnung: null,
    bearbeitungstatus: null,
    erfassungsmasstab: null,
    aufloesung: null,
    lagegenauigkeit: null,
    geobasisdaten: null,
    datenerfassung: null,
    geocat: null,
    gesetzklasse: null,
    lyrs: [],
    documentationhtml: null,
    pdf: {href: '/foo/bar', title: 'foobar'},
    mxd: null,
    opendataswiss: null,
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
      imports: [],
      providers: [provideMockStore(), provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
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

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/services/${testId}`;

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
        url: mockServiceDetailResponse.service.url!.href,
        imageUrl: mockServiceDetailResponse.service.image_url,
        uuid: mockServiceDetailResponse.service.uuid,
        gisZHNr: mockServiceDetailResponse.service.gdsernummer,
        name: mockServiceDetailResponse.service.name,
        access: mockServiceDetailResponse.service.zugang,
        serviceType: mockServiceDetailResponse.service.servicetyp,
        description: mockServiceDetailResponse.service.beschreibung,
        contact: {
          metadata: expectedMockDepartmentalContact,
        },
        datasets: mockServiceDetailResponse.service.datasets.map(({name, uuid, kurzbeschreibung, giszhnr}) => ({
          uuid,
          name,
          shortDescription: kurzbeschreibung,
          gisZHNr: giszhnr,
        })),
      };

      service.loadServiceDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
        done();
      });
    });

    it('handles missing url correctly', (done: DoneFn) => {
      const testId = 'my-test-id';
      const response = structuredClone(mockServiceDetailResponse);
      response.service.url = null;
      spyOn(httpClient, 'get').and.returnValue(of(response));

      service.loadServiceDetail(testId).subscribe((result) => {
        expect(result.url).toBeNull();
        done();
      });
    });
  });

  describe('maps', () => {
    it('creates correct url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockMapDetailResponse));

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/maps/${testId}`;

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
        uuid: mockMapDetailResponse.map.uuid,
        gisZHNr: mockMapDetailResponse.map.gb2_id,
        name: mockMapDetailResponse.map.name,
        gb2Url: mockMapDetailResponse.map.gb2_url,
        externalLinks: mockMapDetailResponse.map.verweise,
        description: mockMapDetailResponse.map.beschreibung,
        intranetUrl: mockMapDetailResponse.map.gbkarten_intranet_url,
        internetUrl: mockMapDetailResponse.map.gbkarten_internet_url,
        contact: {
          geodata: expectedMockDepartmentalContact,
        },
        datasets: mockMapDetailResponse.map.datasets.map(({name, uuid, kurzbeschreibung, giszhnr}) => ({
          uuid,
          name,
          shortDescription: kurzbeschreibung,
          gisZHNr: giszhnr,
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

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/products/${testId}`;

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
        uuid: mockProductDetailResponse.product.uuid,
        gisZHNr: mockProductDetailResponse.product.gdpnummer,
        name: mockProductDetailResponse.product.name,
        description: mockProductDetailResponse.product.beschreibung,
        contact: {
          metadata: expectedMockDepartmentalContact,
        },
        datasets: mockProductDetailResponse.product.datasets.map(({name, uuid, kurzbeschreibung, giszhnr}) => ({
          uuid,
          name,
          shortDescription: kurzbeschreibung,
          gisZHNr: giszhnr,
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

      const expected = `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/datasets/${testId}`;

      service.loadDatasetDetail(testId).subscribe(() => {
        expect(httpClient.get).toHaveBeenCalledOnceWith(expected);
        done();
      });
    });

    it('maps the response correctly with relative pdf url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(of(mockDatasetDetailResponse));

      const expected: DatasetMetadata = {
        keywords: mockDatasetDetailResponse.dataset.keywords,
        topics: mockDatasetDetailResponse.dataset.themen,
        layers: mockDatasetDetailResponse.dataset.layers.map((layer) => ({
          id: layer.giszhnr,
          name: layer.name,
          dataProcurementType: layer.datenbezugart,
          description: layer.beschreibung,
          metadataVisibility: layer.metadaten_sichtbarkeit,
          path: layer.pfadfilename,
          geometryType: layer.geometrietyp,
          attributes: layer.attribute.map((attr) => ({
            name: attr.name,
            description: attr.beschreibung,
            type: attr.typ,
            unit: attr.einheit,
          })),
        })),
        dataBasis: mockDatasetDetailResponse.dataset.datengrundlage,
        remarks: mockDatasetDetailResponse.dataset.bemerkungen,
        pdf: {
          ...mockDatasetDetailResponse.dataset.pdf,
          href: 'https://maps.zh.ch' + (mockDatasetDetailResponse.dataset.pdf?.href || ''),
        },
        outputFormat: mockDatasetDetailResponse.dataset.abgabeformate,
        shortDescription: mockDatasetDetailResponse.dataset.kurzbeschreibung,
        imageUrl: mockDatasetDetailResponse.dataset.image_url,
        uuid: mockDatasetDetailResponse.dataset.uuid,
        gisZHNr: mockDatasetDetailResponse.dataset.giszhnr,
        name: mockDatasetDetailResponse.dataset.name,
        description: mockDatasetDetailResponse.dataset.beschreibung,
        dataCapture: mockDatasetDetailResponse.dataset.datenerfassung,
        resolution: mockDatasetDetailResponse.dataset.aufloesung,
        positionAccuracy: mockDatasetDetailResponse.dataset.lagegenauigkeit,
        mxd: mockDatasetDetailResponse.dataset.mxd,
        ogd: mockDatasetDetailResponse.dataset.ogd,
        lyr: mockDatasetDetailResponse.dataset.lyrs,
        geocat: mockDatasetDetailResponse.dataset.geocat,
        geoBaseData: mockDatasetDetailResponse.dataset.geobasisdaten,
        scale: mockDatasetDetailResponse.dataset.erfassungsmasstab,
        scope: mockDatasetDetailResponse.dataset.geogausdehnung,
        updateType: mockDatasetDetailResponse.dataset.nachfuehrungstyp,
        editingStatus: mockDatasetDetailResponse.dataset.bearbeitungstatus,
        dataStatus: mockDatasetDetailResponse.dataset.datenstand,
        opendataSwiss: mockDatasetDetailResponse.dataset.opendataswiss,
        statuteClass: mockDatasetDetailResponse.dataset.gesetzklasse,
        contact: {
          metadata: expectedMockDepartmentalContact,
          geodata: expectedMockDepartmentalContact,
        },
        maps: mockDatasetDetailResponse.dataset.maps.map(({name, uuid, topic}) => ({name, uuid, topic})),
        products: mockDatasetDetailResponse.dataset.products.map(({name, uuid}) => ({name, uuid})),
        services: mockDatasetDetailResponse.dataset.services.map(({name, uuid, servicetyp}) => ({name, uuid, serviceType: servicetyp})),
      };

      service.loadDatasetDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
        done();
      });
    });

    it('maps the response correctly with absolute pdf url', (done: DoneFn) => {
      const testId = 'my-test-id';
      spyOn(httpClient, 'get').and.returnValue(
        of({
          dataset: {
            ...mockDatasetDetailResponse.dataset,
            pdf: {
              ...mockDatasetDetailResponse.dataset.pdf,
              href: 'https://geo.zh.ch' + (mockDatasetDetailResponse.dataset.pdf?.href || ''),
            },
          },
        }),
      );

      const expected: DatasetMetadata = {
        keywords: mockDatasetDetailResponse.dataset.keywords,
        topics: mockDatasetDetailResponse.dataset.themen,
        layers: mockDatasetDetailResponse.dataset.layers.map((layer) => ({
          id: layer.giszhnr,
          name: layer.name,
          dataProcurementType: layer.datenbezugart,
          description: layer.beschreibung,
          metadataVisibility: layer.metadaten_sichtbarkeit,
          path: layer.pfadfilename,
          geometryType: layer.geometrietyp,
          attributes: layer.attribute.map((attr) => ({
            name: attr.name,
            description: attr.beschreibung,
            type: attr.typ,
            unit: attr.einheit,
          })),
        })),
        dataBasis: mockDatasetDetailResponse.dataset.datengrundlage,
        remarks: mockDatasetDetailResponse.dataset.bemerkungen,
        pdf: {
          ...mockDatasetDetailResponse.dataset.pdf,
          href: 'https://geo.zh.ch' + (mockDatasetDetailResponse.dataset.pdf?.href || ''),
        },
        outputFormat: mockDatasetDetailResponse.dataset.abgabeformate,
        shortDescription: mockDatasetDetailResponse.dataset.kurzbeschreibung,
        imageUrl: mockDatasetDetailResponse.dataset.image_url,
        uuid: mockDatasetDetailResponse.dataset.uuid,
        gisZHNr: mockDatasetDetailResponse.dataset.giszhnr,
        name: mockDatasetDetailResponse.dataset.name,
        description: mockDatasetDetailResponse.dataset.beschreibung,
        dataCapture: mockDatasetDetailResponse.dataset.datenerfassung,
        resolution: mockDatasetDetailResponse.dataset.aufloesung,
        positionAccuracy: mockDatasetDetailResponse.dataset.lagegenauigkeit,
        mxd: mockDatasetDetailResponse.dataset.mxd,
        ogd: mockDatasetDetailResponse.dataset.ogd,
        lyr: mockDatasetDetailResponse.dataset.lyrs,
        geocat: mockDatasetDetailResponse.dataset.geocat,
        geoBaseData: mockDatasetDetailResponse.dataset.geobasisdaten,
        scale: mockDatasetDetailResponse.dataset.erfassungsmasstab,
        scope: mockDatasetDetailResponse.dataset.geogausdehnung,
        updateType: mockDatasetDetailResponse.dataset.nachfuehrungstyp,
        editingStatus: mockDatasetDetailResponse.dataset.bearbeitungstatus,
        dataStatus: mockDatasetDetailResponse.dataset.datenstand,
        opendataSwiss: mockDatasetDetailResponse.dataset.opendataswiss,
        statuteClass: mockDatasetDetailResponse.dataset.gesetzklasse,
        contact: {
          metadata: expectedMockDepartmentalContact,
          geodata: expectedMockDepartmentalContact,
        },
        maps: mockDatasetDetailResponse.dataset.maps.map(({name, uuid, topic}) => ({name, uuid, topic})),
        products: mockDatasetDetailResponse.dataset.products.map(({name, uuid}) => ({name, uuid})),
        services: mockDatasetDetailResponse.dataset.services.map(({name, uuid, servicetyp}) => ({name, uuid, serviceType: servicetyp})),
      };

      service.loadDatasetDetail(testId).subscribe((result) => {
        expect(result).toEqual(expected);
        done();
      });
    });
  });

  describe('load all', () => {
    it('calls all 4 overview endpoints once and groups the result into a flat map, using the correct properties', (done: DoneFn) => {
      const httpTestingController = TestBed.inject(HttpTestingController);

      service
        .loadFullList()
        .pipe()
        .subscribe((result) => {
          const expected: OverviewMetadataItem[] = [
            new ServiceOverviewMetadataItem(
              mockServiceDetailResponse.service.uuid,
              mockServiceDetailResponse.service.name,
              mockServiceDetailResponse.service.beschreibung,
              mockServiceDetailResponse.service.kontakt_metadaten.amt,
            ),
            new MapOverviewMetadataItem(
              mockMapDetailResponse.map.uuid,
              mockMapDetailResponse.map.name,
              mockMapDetailResponse.map.beschreibung,
              mockMapDetailResponse.map.kontakt_metadaten.amt,
            ),
            new ProductOverviewMetadataItem(
              mockProductDetailResponse.product.uuid,
              mockProductDetailResponse.product.name,
              mockProductDetailResponse.product.beschreibung,
              mockProductDetailResponse.product.kontakt_metadaten.amt,
            ),
            new DatasetOverviewMetadataItem(
              mockDatasetDetailResponse.dataset.uuid,
              mockDatasetDetailResponse.dataset.name,
              mockDatasetDetailResponse.dataset.kurzbeschreibung,
              mockDatasetDetailResponse.dataset.kontakt_metadaten.amt,
              mockDatasetDetailResponse.dataset.abgabeformate,
              mockDatasetDetailResponse.dataset.ogd,
            ),
          ];
          httpTestingController.verify();
          expect(result).toEqual(jasmine.arrayWithExactContents(expected));
          done();
        });

      const datasetsRequest = httpTestingController.expectOne(
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/datasets`,
      );
      datasetsRequest.flush({datasets: [mockDatasetDetailResponse.dataset]});
      const mapsRequest = httpTestingController.expectOne(
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/maps`,
      );
      mapsRequest.flush({maps: [mockMapDetailResponse.map]});
      const productsRequest = httpTestingController.expectOne(
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/products`,
      );
      productsRequest.flush({products: [mockProductDetailResponse.product]});
      const servicesRequest = httpTestingController.expectOne(
        `${configService.apiConfig.gb2Api.baseUrl}/${configService.apiConfig.gb2Api.version}/metadata/services`,
      );
      servicesRequest.flush({services: [mockServiceDetailResponse.service]});
    });
  });
});
