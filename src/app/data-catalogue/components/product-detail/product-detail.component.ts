import {Component, Inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetail} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent extends AbstractBaseDetail<ProductMetadata> {
  public baseMetadataInformation?: BaseMetadataInformation;
  public informationElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];

  constructor(
    @Inject(ActivatedRoute) route: ActivatedRoute,
    @Inject(Gb3MetadataService) gb3MetadataService: Gb3MetadataService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super(route, gb3MetadataService, configService);
  }

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadProductDetail(id);
  }

  protected handleMetadata(productMetadata: ProductMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(productMetadata);
    this.informationElements = this.extractInformationElements(productMetadata);
    this.metadataContactElements = DataExtractionUtils.extractContactElements(productMetadata.contact.metadata);
    this.linkedDatasets = productMetadata.datasets;
  }

  private extractBaseMetadataInformation(productMetadata: ProductMetadata): BaseMetadataInformation {
    return {
      itemTitle: productMetadata.name,
      keywords: ['Produkt'], // todo: add OGD status once API delivers that
    };
  }

  private extractInformationElements(productMetadata: ProductMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: productMetadata.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: productMetadata.name, type: 'text'},
      {title: 'Beschreibung', value: productMetadata.description, type: 'text'},
    ];
  }
}
