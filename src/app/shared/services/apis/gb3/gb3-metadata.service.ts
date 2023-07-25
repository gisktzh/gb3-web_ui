import {Injectable} from '@angular/core';
import {Gb3ApiService} from './gb3-api.service';
import {DataCataloguePage} from '../../../enums/data-catalogue-page.enum';
import {
  MetadataDatasetsDetailData,
  MetadataMapsDetailData,
  MetadataProductsDetailData,
  MetadataServicesDetailData,
} from '../../../models/gb3-api-generated.interfaces';
import {Observable} from 'rxjs';
import {
  DatasetMetadata,
  DepartmentalContact,
  MapMetadata,
  ProductMetadata,
  ServiceMetadata,
} from '../../../interfaces/gb3-metadata.interface';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Gb3MetadataService extends Gb3ApiService {
  protected endpoint: string = 'metadata';

  public loadDatasetDetail(id: string): Observable<DatasetMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Datasets, id);
    const datasetsDetailData = this.get<MetadataDatasetsDetailData>(requestUrl);
    return datasetsDetailData.pipe(map((result) => this.transformDatasetsDetailDataToDatasetMetadata(result)));
  }

  public loadMapDetail(id: string): Observable<MapMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Maps, id);
    const mapsDetailData = this.get<MetadataMapsDetailData>(requestUrl);
    return mapsDetailData.pipe(map((result) => this.transformMapsDetailToMapMetadata(result)));
  }

  public loadServiceDetail(id: string): Observable<ServiceMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Services, id);
    const servicesDetailData = this.get<MetadataServicesDetailData>(requestUrl);
    return servicesDetailData.pipe(map((result) => this.transformServicesDetailToMapMetadata(result)));
  }

  public loadProductDetail(id: string): Observable<ProductMetadata> {
    const requestUrl = this.createFullEndpointUrl(DataCataloguePage.Products, id);
    const productsDetailData = this.get<MetadataProductsDetailData>(requestUrl);
    return productsDetailData.pipe(map((result) => this.transformProductDetailToMapMetadata(result)));
  }

  private transformDatasetsDetailDataToDatasetMetadata({dataset}: MetadataDatasetsDetailData): DatasetMetadata {
    return {
      ...dataset,
      shortDescription: dataset.kurzbeschreibung,
      description: dataset.beschreibung,
      remarks: dataset.bemerkungen,
      topics: dataset.themen,
      dataBasis: dataset.datengrundlage,
      outputFormat: dataset.abgabeformat,
      usageRestrictions: dataset.anwendungeinschraenkung,
      pdfName: dataset.pdf_name,
      pdfUrl: dataset.pdf_url,
      imageUrl: dataset.image_url,
      contact: {
        geodata: this.extractContactDetails(dataset.kontakt.geodaten),
        metadata: this.extractContactDetails(dataset.kontakt.metadaten),
      },
      layers: dataset.layers.map((layer) => ({
        dataProcurementType: layer.datenbezugart,
        metadataVisibility: layer.metadaten_sichtbarkeit,
        description: layer.beschreibung,
        ...layer,
      })),
      services: dataset.services.map((service) => ({
        serviceType: service.servicetyp,
        ...service,
      })),
    };
  }

  private transformMapsDetailToMapMetadata({map: mapData}: MetadataMapsDetailData): MapMetadata {
    return {
      ...mapData,
      description: mapData.beschreibung,
      imageUrl: mapData.image_url,
      datasets: mapData.datasets.map((dataset) => ({
        shortDescription: dataset.kurzbeschreibung,
        ...dataset,
      })),
      contact: {
        geodata: this.extractContactDetails(mapData.kontakt.geodaten),
      },
    };
  }

  private transformServicesDetailToMapMetadata({service}: MetadataServicesDetailData): ServiceMetadata {
    return {
      ...service,
      access: service.zugang,
      contact: {
        metadata: this.extractContactDetails(service.kontakt.metadaten),
      },
      datasets: service.datasets.map((dataset) => ({
        shortDescription: dataset.kurzbeschreibung,
        ...dataset,
      })),
      serviceType: service.servicetyp,
      description: service.beschreibung,
      imageUrl: service.image_url,
    };
  }

  private transformProductDetailToMapMetadata({product}: MetadataProductsDetailData): ProductMetadata {
    return {
      ...product,
      contact: {
        metadata: this.extractContactDetails(product.kontakt.metadaten),
      },
      description: product.beschreibung,
      imageUrl: product.image_url,
      datasets: product.datasets.map((dataset) => ({
        shortDescription: dataset.kurzbeschreibung,
        ...dataset,
      })),
    };
  }

  /**
   * Extracts contact details from a result set. Because we don't have proper API types for the contact details even though we know that
   * the details are the same for all types, we can use one of the result types' (here: Dataset) contact information in a generic way to
   * typehint and create an ad-hoc schema for the contact.
   */
  private extractContactDetails<K extends keyof MetadataDatasetsDetailData['dataset']['kontakt']>(
    contact: MetadataDatasetsDetailData['dataset']['kontakt'][K],
  ): DepartmentalContact {
    return {
      department: contact.amt,
      division: contact.fachstelle,
      section: contact.sektion,
      url: contact.weburl,
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

  private createFullEndpointUrl(endpoint: DataCataloguePage, id: string): string {
    const url = new URL(`${this.getFullEndpointUrl()}/${endpoint}/${id}`);

    return url.toString();
  }
}
