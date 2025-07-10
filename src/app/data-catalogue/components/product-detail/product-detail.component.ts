import {Component} from '@angular/core';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: false,
})
export class ProductDetailComponent extends AbstractBaseDetailComponent<ProductMetadata> {
  public baseMetadataInformation?: BaseMetadataInformation;
  public informationElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];

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
      category: 'Produkt',
      shortDescription: productMetadata.description,
      imageUrl: null,
    };
  }

  private extractInformationElements(productMetadata: ProductMetadata): DataDisplayElement[] {
    return [{title: 'Nr.', value: productMetadata.gisZHNr.toString(), type: 'text'}];
  }
}
