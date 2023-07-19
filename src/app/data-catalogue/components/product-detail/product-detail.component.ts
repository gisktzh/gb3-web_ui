import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {DepartmentalContact, ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {DataDisplayElement} from '../data-display/data-display.component';

interface DatasetInformation {
  title: string;
  keywords: string[];
}

interface DataLink {
  name: string;
  guid: number;
  shortDescription: string;
}

@Component({
  selector: 'product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  public datasetInformation: DatasetInformation | undefined;
  public metadataContactElements: DataDisplayElement[] = [];
  public informationElements: DataDisplayElement[] = [];
  public linkedDatasets: DataLink[] = [];
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
            const id = params.get('id');
            if (!id) {
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadProductDetail(id);
          }),
          tap((results) => {
            this.datasetInformation = this.extractDatasetInformation(results);
            this.metadataContactElements = this.extractContactElements(results.contact.metadata);
            this.informationElements = this.extractInformationElements(results);
            this.linkedDatasets = this.extractLinkedDatasets(results);
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

  private extractLinkedDatasets({datasets}: ProductMetadata): DataLink[] {
    return datasets.map((dataset) => ({...dataset}));
  }

  private extractInformationElements(data: ProductMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: data.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: data.name, type: 'text'},
      {title: 'Beschreibung', value: data.description, type: 'text'},
    ];
  }

  private extractDatasetInformation(results: ProductMetadata): DatasetInformation {
    return {
      title: results.name,
      keywords: ['Produkt'], // todo: add OGD status once API delivers that
    };
  }
}
