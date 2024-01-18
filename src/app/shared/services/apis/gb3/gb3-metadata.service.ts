import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {DataCataloguePage} from '../../../enums/data-catalogue-page.enum';
import {
  Contact,
  Dataset,
  LinkObject as Gb3LinkObject,
  Map,
  MetadataDatasetsDetailData,
  MetadataDatasetsListData,
  MetadataMapsDetailData,
  MetadataMapsListData,
  MetadataProductsDetailData,
  MetadataProductsListData,
  MetadataServicesDetailData,
  MetadataServicesListData,
  Product,
  Service,
} from '../../../models/gb3-api-generated.interfaces';
import {forkJoin, Observable} from 'rxjs';
import {
  DatasetMetadata,
  DepartmentalContact,
  LinkedDataset,
  MapMetadata,
  ProductMetadata,
  ServiceMetadata,
} from '../../../interfaces/gb3-metadata.interface';
import {map} from 'rxjs/operators';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
  ProductOverviewMetadataItem,
  ServiceOverviewMetadataItem,
} from '../../../models/overview-metadata-item.model';
import {LinkObject} from '../../../interfaces/link-object.interface';

@Injectable({
  providedIn: 'root',
})
export class Gb3MetadataService extends Gb3ApiService {
  protected endpoint: string = 'metadata';
  private readonly staticFilesUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;

  public loadFullList(): Observable<OverviewMetadataItem[]> {
    return forkJoin([this.loadDatasets(), this.loadProducts(), this.loadMaps(), this.loadServices()]).pipe(
      map((results) => results.flat().sort((a, b) => a.name.localeCompare(b.name))),
    );
  }

  public loadDatasetDetail(id: string): Observable<DatasetMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Datasets, id);
    const datasetsDetailData = this.get<MetadataDatasetsDetailData>(requestUrl);
    return datasetsDetailData.pipe(map(({dataset}) => this.transformDatasetsDetailDataToDatasetMetadata(dataset)));
  }

  public loadMapDetail(id: string): Observable<MapMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Maps, id);
    const mapsDetailData = this.get<MetadataMapsDetailData>(requestUrl);
    return mapsDetailData.pipe(map(({map: mapDetail}) => this.transformMapsDetailToMapMetadata(mapDetail)));
  }

  public loadServiceDetail(id: string): Observable<ServiceMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Services, id);
    const servicesDetailData = this.get<MetadataServicesDetailData>(requestUrl);
    return servicesDetailData.pipe(map(({service}) => this.transformServicesDetailToServiceMetadata(service)));
  }

  public loadProductDetail(id: string): Observable<ProductMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Products, id);
    const productsDetailData = this.get<MetadataProductsDetailData>(requestUrl);
    return productsDetailData.pipe(map(({product}) => this.transformProductDetailToProductMetadata(product)));
  }

  private loadDatasets(): Observable<DatasetOverviewMetadataItem[]> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Datasets);
    const datasets = this.get<MetadataDatasetsListData>(requestUrl);
    return datasets.pipe(
      map((result) =>
        result.datasets.map((dataset) => {
          const {
            uuid: guid,
            description,
            name,
            contact: {
              metadata: {department},
            },
            outputFormat,
          } = this.transformDatasetsDetailDataToDatasetMetadata(dataset);
          return new DatasetOverviewMetadataItem(guid, name, description, department, outputFormat);
        }),
      ),
    );
  }

  private loadProducts(): Observable<ProductOverviewMetadataItem[]> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Products);
    const datasets = this.get<MetadataProductsListData>(requestUrl);
    return datasets.pipe(
      map((result) =>
        result.products.map((product) => {
          const {
            uuid: guid,
            description,
            name,
            contact: {
              metadata: {department},
            },
          } = this.transformProductDetailToProductMetadata(product);
          return new ProductOverviewMetadataItem(guid, name, description, department);
        }),
      ),
    );
  }

  private loadMaps(): Observable<MapOverviewMetadataItem[]> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Maps);
    const datasets = this.get<MetadataMapsListData>(requestUrl);
    return datasets.pipe(
      map((result) =>
        result.maps.map((mapMetadata) => {
          const {
            uuid: guid,
            description,
            name,
            contact: {
              geodata: {department},
            },
          } = this.transformMapsDetailToMapMetadata(mapMetadata);
          return new MapOverviewMetadataItem(guid, name, description, department);
        }),
      ),
    );
  }

  private loadServices(): Observable<ServiceOverviewMetadataItem[]> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Services);
    const datasets = this.get<MetadataServicesListData>(requestUrl);
    return datasets.pipe(
      map((result) =>
        result.services.map((service) => {
          const {
            uuid: guid,
            description,
            name,
            contact: {
              metadata: {department},
            },
          } = this.transformServicesDetailToServiceMetadata(service);
          return new ServiceOverviewMetadataItem(guid, name, description, department);
        }),
      ),
    );
  }

  private transformDatasetsDetailDataToDatasetMetadata(dataset: Dataset): DatasetMetadata {
    return {
      name: dataset.name,
      maps: dataset.maps.map(({uuid, name, topic}) => ({uuid, name, topic})),
      uuid: dataset.uuid,
      gisZHNr: dataset.giszhnr,
      keywords: dataset.keywords,
      ogd: dataset.ogd,
      products: dataset.products.map(({name, uuid}) => ({name, uuid})),
      shortDescription: dataset.kurzbeschreibung,
      description: dataset.beschreibung,
      remarks: dataset.bemerkungen,
      topics: dataset.themen,
      dataBasis: dataset.datengrundlage,
      dataCapture: dataset.datenerfassung,
      outputFormat: dataset.abgabeformate,
      scale: dataset.erfassungsmasstab,
      resolution: dataset.aufloesung,
      positionAccuracy: dataset.lagegenauigkeit,
      scope: dataset.geogausdehnung,
      dataStatus: dataset.datenstand,
      updateType: dataset.nachfuehrungstyp,
      editingStatus: dataset.bearbeitungstatus,
      statuteClass: dataset.gesetzklasse,
      geoBaseData: dataset.geobasisdaten,
      geocat: dataset.geocat ? this.createLinkObject(dataset.geocat) : null,
      opendataSwiss: dataset.opendataswiss ? this.createLinkObject(dataset.opendataswiss) : null,
      mxd: dataset.mxd ? this.createLinkObject(dataset.mxd) : null,
      lyr: dataset.lyrs,
      pdf: dataset.pdf ? {href: this.createAbsoluteUrl(dataset.pdf.href), title: dataset.pdf.title} : null,
      imageUrl: dataset.image_url ? this.createAbsoluteUrl(dataset.image_url) : null,
      contact: {
        geodata: this.extractContactDetails(dataset.kontakt_geodaten),
        metadata: this.extractContactDetails(dataset.kontakt_metadaten),
      },
      layers: dataset.layers.map((layer) => ({
        dataProcurementType: layer.datenbezugart,
        metadataVisibility: layer.metadaten_sichtbarkeit,
        description: layer.beschreibung,
        id: layer.giszhnr,
        name: layer.name,
        attributes: layer.attribute.map((attr) => ({
          name: attr.name,
          description: attr.beschreibung,
          type: attr.typ,
          unit: attr.einheit,
        })),
        path: layer.pfadfilename,
        geometryType: layer.geometrietyp,
      })),
      services: dataset.services.map((service) => ({
        serviceType: service.servicetyp,
        uuid: service.uuid,
        name: service.name,
      })),
    };
  }

  private transformMapsDetailToMapMetadata(mapData: Map): MapMetadata {
    return {
      topic: mapData.topic,
      uuid: mapData.uuid,
      gisZHNr: mapData.gb2_id,
      name: mapData.name,
      description: mapData.beschreibung,
      imageUrl: mapData.image_url ? this.createAbsoluteUrl(mapData.image_url) : null,
      externalLinks: mapData.verweise,
      gb2Url: mapData.gb2_url
        ? {
            href: this.createAbsoluteUrl(mapData.gb2_url.href),
            title: mapData.gb2_url.title,
          }
        : null,
      datasets: mapData.datasets.map(this.extractDatasetDetail),
      contact: {
        geodata: this.extractContactDetails(mapData.kontakt_geodaten),
      },
    };
  }

  private transformServicesDetailToServiceMetadata(service: Service): ServiceMetadata {
    return {
      uuid: service.uuid,
      gisZHNr: service.gdsernummer,
      name: service.name,
      url: service.url.href,
      version: service.version,
      access: service.zugang,
      contact: {
        metadata: this.extractContactDetails(service.kontakt_metadaten),
      },
      datasets: service.datasets.map(this.extractDatasetDetail),
      serviceType: service.servicetyp,
      description: service.beschreibung,
      imageUrl: service.image_url ? this.createAbsoluteUrl(service.image_url) : null,
    };
  }

  private transformProductDetailToProductMetadata(product: Product): ProductMetadata {
    return {
      uuid: product.uuid,
      gisZHNr: product.gdpnummer,
      name: product.name,
      contact: {
        metadata: this.extractContactDetails(product.kontakt_metadaten),
      },
      description: product.beschreibung,
      imageUrl: product.image_url ? this.createAbsoluteUrl(product.image_url) : null,
      datasets: product.datasets.map(this.extractDatasetDetail),
    };
  }

  /**
   * Extracts a dataset detail in the correct way for usage within MetadataDetailPages
   * @param dataset
   * @private
   */
  private extractDatasetDetail<
    T extends (
      | MetadataMapsDetailData['map']
      | MetadataProductsDetailData['product']
      | MetadataServicesDetailData['service']
    )['datasets'][number],
  >(dataset: T): LinkedDataset {
    return {
      shortDescription: dataset.kurzbeschreibung,
      uuid: dataset.uuid,
      name: dataset.name,
      gisZHNr: dataset.giszhnr,
    };
  }

  /**
   * Extracts contact details from a result set. Because we don't have proper API types for the contact details even though we know that
   * the details are the same for all types, we can use one of the result types' (here: Dataset) contact information in a generic way to
   * typehint and create an ad-hoc schema for the contact.
   */
  private extractContactDetails(contact: Contact): DepartmentalContact {
    return {
      department: contact.amt,
      division: contact.fachstelle,
      section: contact.sektion,
      url: contact.weburl.href,
      street: contact.strassenname,
      poBox: contact.postfach,
      email: contact.email,
      zipCode: contact.plz,
      phone: contact.telephon,
      phoneDirect: contact.telephon_direkt,
      firstName: contact.vorname,
      lastName: contact.nachname,
      houseNumber: contact.hausnummer,
      village: contact.ortschaft,
    };
  }

  private createFullEndpointUrl(endpoint: DataCataloguePage, id?: string): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${endpoint}`);

    if (id) {
      url.pathname += `/${id}`;
    }

    return url.toString();
  }

  private createAbsoluteUrl(relativeImageUrl: string): string {
    const url = new URL(`${this.staticFilesUrl}${relativeImageUrl}`);
    return url.toString();
  }

  private createLinkObject(gb3LinkObject: Gb3LinkObject): LinkObject {
    return {href: gb3LinkObject.href, title: gb3LinkObject.title};
  }
}
