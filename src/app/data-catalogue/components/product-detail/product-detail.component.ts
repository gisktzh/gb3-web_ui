import {Component, ErrorHandler, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {Store} from '@ngrx/store';

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

  constructor(
    @Inject(ActivatedRoute) route: ActivatedRoute,
    @Inject(Gb3MetadataService) gb3MetadataService: Gb3MetadataService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(Router) router: Router,
    @Inject(ErrorHandler) errorHandler: ErrorHandler,
    @Inject(Store) store: Store,
  ) {
    super(route, gb3MetadataService, configService, router, errorHandler, store);
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
      category: 'Produkt',
      shortDescription: productMetadata.description,
      imageUrl: null,
    };
  }

  private extractInformationElements(productMetadata: ProductMetadata): DataDisplayElement[] {
    return [{title: 'Nr.', value: productMetadata.gisZHNr.toString(), type: 'text'}];
  }
}
