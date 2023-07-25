import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {catchError} from 'rxjs/operators';
import {DataDisplayElement} from '../../types/data-display-element';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  public baseMetadataInformation?: BaseMetadataInformation;
  public metadataContactElements: DataDisplayElement[] = [];
  public informationElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];
  public loadingState: LoadingState = 'loading';
  public readonly apiBaseUrl: string;
  public readonly mainPageEnum = MainPage;
  public readonly dataCataloguePageEnum = DataCataloguePage;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly gb3MetadataService: Gb3MetadataService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = params.get(RouteParamConstants.RESOURCE_IDENTIFIER);
            if (!id) {
              // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadProductDetail(id).pipe(
              catchError((err: unknown) => {
                this.loadingState = 'error';
                return throwError(() => err); // todo: forward to 404 page
              }),
            );
          }),
          tap((productMetadata) => {
            this.baseMetadataInformation = this.extractBaseMetadataInformation(productMetadata);
            this.metadataContactElements = DataExtractionUtils.extractContactElements(productMetadata.contact.metadata);
            this.informationElements = this.extractInformationElements(productMetadata);
            this.linkedDatasets = productMetadata.datasets;
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractInformationElements(productMetadata: ProductMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: productMetadata.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: productMetadata.name, type: 'text'},
      {title: 'Beschreibung', value: productMetadata.description, type: 'text'},
    ];
  }

  private extractBaseMetadataInformation(productMetadata: ProductMetadata): BaseMetadataInformation {
    return {
      itemTitle: productMetadata.name,
      keywords: ['Produkt'], // todo: add OGD status once API delivers that
    };
  }
}
