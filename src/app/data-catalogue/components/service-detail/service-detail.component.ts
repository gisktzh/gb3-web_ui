import {Component, OnDestroy, OnInit} from '@angular/core';
import {DepartmentalContact, ServiceMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {DataDisplayElement} from '../data-display/data-display.component';
import {Clipboard} from '@angular/cdk/clipboard';

interface DataLink {
  name: string;
  guid: number;
  shortDescription: string;
}

interface DatasetInformation {
  title: string;
}

@Component({
  selector: 'service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  public datasetInformation: DatasetInformation | undefined;
  public metadataContactElements: DataDisplayElement[] = [];
  public informationElements: DataDisplayElement[] = [];
  public linkedDatasets: DataLink[] = [];
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
    private readonly clipboardService: Clipboard,
  ) {
    this.apiBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public copyToClipboard() {
    if (this.serviceUrlForCopy) {
      this.clipboardService.copy(this.serviceUrlForCopy);
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const id = params.get('id');
            if (!id) {
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadServiceDetail(id);
          }),
          tap((results) => {
            this.datasetInformation = this.extractDatasetInformation(results);
            this.metadataContactElements = this.extractContactElements(results.contact.metadata);
            this.informationElements = this.extractInformationElements(results);
            this.linkedDatasets = this.extractLinkedDatasets(results);
            this.serviceUrlForCopy = results.url;
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractContactElements(contact: DepartmentalContact): DataDisplayElement[] {
    return [
      {title: 'Organisation', value: contact.department, type: 'text'},
      {title: 'Abteilung', value: contact.division, type: 'text'},
      {title: 'Kontaktperson', value: `${contact.firstName} ${contact.lastName}`, type: 'text'},
      {title: 'Adresse', value: `${contact.street} ${contact.houseNumber}, ${contact.zipCode} ${contact.village}`, type: 'text'},
      {title: 'Tel', value: contact.phone, type: 'text'},
      {title: 'Tel direkt', value: contact.phoneDirect, type: 'text'},
      {title: 'E-Mail', value: contact.email, type: 'email'},
      {title: 'www', value: contact.url, type: 'url'},
    ];
  }

  private extractInformationElements(data: ServiceMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: data.guid.toString(), type: 'text'},
      {title: 'Geodienst', value: data.serviceType, type: 'text'},
      {title: 'Bezeichnung', value: data.name, type: 'text'},
      {title: 'Beschreibung', value: data.description, type: 'text'},
      {title: 'URL', value: data.url, type: 'url'},
      {title: 'GetCapabilities', value: this.createGetCapabilitiesLink(data.url, data.serviceType), type: 'url'},
      {title: 'Version', value: data.version, type: 'text'},
      {title: 'Zugang', value: data.access, type: 'text'},
    ];
  }

  private extractDatasetInformation(results: ServiceMetadata): DatasetInformation {
    return {
      title: results.name,
    };
  }

  private extractLinkedDatasets({datasets}: ServiceMetadata): DataLink[] {
    return datasets.map((dataset) => ({...dataset}));
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
