import {Component} from '@angular/core';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {DataCatalogueDetailPageComponent} from '../data-catalogue-detail-page/data-catalogue-detail-page.component';
import {DataCatalogueDetailPageSectionComponent} from '../data-catalogue-detail-page-section/data-catalogue-detail-page-section.component';
import {DataDisplaySectionComponent} from '../data-display-section/data-display-section.component';
import {DataDisplayComponent} from '../data-display/data-display.component';
import {GenericUnorderedListComponent} from '../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';
import {DescriptiveHighlightedLinkComponent} from '../../../shared/components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  imports: [
    LoadingAndProcessBarComponent,
    DataCatalogueDetailPageComponent,
    DataCatalogueDetailPageSectionComponent,
    DataDisplaySectionComponent,
    DataDisplayComponent,
    GenericUnorderedListComponent,
    DescriptiveHighlightedLinkComponent,
    MatIconButton,
    RouterLink,
    MatIcon,
  ],
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
