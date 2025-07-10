import {Component} from '@angular/core';
import {ServiceMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';

@Component({
  selector: 'service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
  standalone: false,
})
export class ServiceDetailComponent extends AbstractBaseDetailComponent<ServiceMetadata> {
  public baseMetadataInformation?: BaseMetadataInformation;
  public informationElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public serviceUrlForCopy?: string | null;
  public linkedDatasets: MetadataLink[] = [];

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadServiceDetail(id);
  }

  protected handleMetadata(serviceMetadata: ServiceMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(serviceMetadata);
    this.informationElements = this.extractInformationElements(serviceMetadata);
    this.metadataContactElements = DataExtractionUtils.extractContactElements(serviceMetadata.contact.metadata);
    this.linkedDatasets = serviceMetadata.datasets;
    this.serviceUrlForCopy = serviceMetadata.url;
  }

  private extractBaseMetadataInformation(serviceMetadata: ServiceMetadata): BaseMetadataInformation {
    return {
      itemTitle: serviceMetadata.name,
      category: 'Geodienst',
      shortDescription: serviceMetadata.description,
      imageUrl: null,
    };
  }

  private extractInformationElements(serviceMetadata: ServiceMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: serviceMetadata.gisZHNr.toString(), type: 'text'},
      {title: 'Geodienst', value: serviceMetadata.serviceType, type: 'text'},
      this.handleServiceUrl(serviceMetadata),
      {title: 'Version', value: serviceMetadata.version, type: 'text'},
      {title: 'Zugang', value: serviceMetadata.access, type: 'text'},
    ];
  }

  private handleServiceUrl({url, serviceType}: ServiceMetadata): DataDisplayElement {
    if (url) {
      return {
        title: 'GetCapabilities',
        value: {href: this.createGetCapabilitiesLink(url, serviceType)},
        type: 'url',
      };
    }

    return {title: 'GetCapabilities', value: null, type: 'text'};
  }

  private createGetCapabilitiesLink(baseUrl: string, serviceType: string): string {
    try {
      const url = new URL(baseUrl);
      url.searchParams.append('service', serviceType);
      url.searchParams.append('request', 'GetCapabilities');

      return url.toString();
    } catch (e) {
      return baseUrl;
    }
  }
}
