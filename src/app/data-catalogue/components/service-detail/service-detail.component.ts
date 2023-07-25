import {Component, OnDestroy, OnInit} from '@angular/core';
import {ServiceMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {BaseMetadataInformation} from '../../../shared/interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../../shared/interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {catchError} from 'rxjs/operators';
import {DataDisplayElement} from '../../types/data-display-element';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

@Component({
  selector: 'service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  public baseMetadataInformation?: BaseMetadataInformation;
  public metadataContactElements: DataDisplayElement[] = [];
  public informationElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];
  public loadingState: LoadingState = 'loading';
  public serviceUrlForCopy?: string;
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
            return this.gb3MetadataService.loadServiceDetail(id).pipe(
              catchError((err: unknown) => {
                this.loadingState = 'error';
                return throwError(() => err); // todo: forward to 404 page
              }),
            );
          }),
          tap((serviceMetadata) => {
            this.baseMetadataInformation = this.extractBaseMetadataInformation(serviceMetadata);
            this.metadataContactElements = DataExtractionUtils.extractContactElements(serviceMetadata.contact.metadata);
            this.informationElements = this.extractInformationElements(serviceMetadata);
            this.linkedDatasets = serviceMetadata.datasets;
            this.serviceUrlForCopy = serviceMetadata.url;
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractInformationElements(serviceMetadata: ServiceMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: serviceMetadata.guid.toString(), type: 'text'},
      {title: 'Geodienst', value: serviceMetadata.serviceType, type: 'text'},
      {title: 'Bezeichnung', value: serviceMetadata.name, type: 'text'},
      {title: 'Beschreibung', value: serviceMetadata.description, type: 'text'},
      {title: 'URL', value: serviceMetadata.url, type: 'url'},
      {title: 'GetCapabilities', value: this.createGetCapabilitiesLink(serviceMetadata.url, serviceMetadata.serviceType), type: 'url'},
      {title: 'Version', value: serviceMetadata.version, type: 'text'},
      {title: 'Zugang', value: serviceMetadata.access, type: 'text'},
    ];
  }

  private extractBaseMetadataInformation(serviceMetadata: ServiceMetadata): BaseMetadataInformation {
    return {
      itemTitle: serviceMetadata.name,
      keywords: ['Geodienst'], // todo: add OGD status once API delivers that
    };
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
