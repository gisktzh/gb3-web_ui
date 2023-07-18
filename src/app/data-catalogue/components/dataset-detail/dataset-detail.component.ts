import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {DatasetMetadata, DepartmentalContact} from '../../../shared/interfaces/gb3-metadata.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../data-display/data-display.component';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';

interface DatasetInformation {
  title: string;
  description: string;
  keywords: string[];
}

interface DataLink {
  name: string;
  guid: number;
}

interface MapLink extends DataLink {
  topic: string;
}

@Component({
  selector: 'dataset-detail',
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss'],
})
export class DatasetDetailComponent implements OnInit, OnDestroy {
  public datasetInformation: DatasetInformation | undefined;
  public informationElements: DataDisplayElement[] = [];
  public geodataContactElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public dataBasisElements: DataDisplayElement[] = [];
  public dataProcurement: DataDisplayElement[] = [];
  public linkedData: {maps: MapLink[]; services: DataLink[]; products: DataLink[]} = {
    maps: [],
    services: [],
    products: [],
  };
  public loadingState: LoadingState = 'loading';
  public readonly apiBaseUrl: string = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  public readonly mainPageEnum = MainPage;
  public readonly dataCataloguePageEnum = DataCataloguePage;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly gb3MetadataService: Gb3MetadataService,
    private readonly configService: ConfigService,
  ) {}

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
            return this.gb3MetadataService.loadDatasetDetail(id);
          }),
          tap((results) => {
            this.datasetInformation = this.extractDatasetInformation(results);
            this.informationElements = this.extractInformationElements(results);
            this.geodataContactElements = this.extractContactElements(results.contact.geodata);
            this.metadataContactElements = this.extractContactElements(results.contact.metadata);
            this.dataBasisElements = this.extractDataBasisElements(results);
            this.dataProcurement = this.extractDataProcurementElements(results);

            this.linkedData.maps = [...results.maps];
            this.linkedData.services = [...results.services];
            this.linkedData.products = [...results.products];
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractInformationElements(data: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: data.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: data.name, type: 'text'},
      {title: 'Kurzbeschreibung', value: data.shortDescription, type: 'text'},
      {title: 'Beschreibung', value: data.description, type: 'text'},
      {title: 'eCH Geokategorien / Themen', value: data.topics, type: 'text'},
    ];
  }

  private extractDatasetInformation(results: DatasetMetadata): DatasetInformation {
    return {
      title: results.name,
      description: results.description,
      keywords: results.keywords ? results.keywords?.split(',') : [],
    };
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

  private extractDataBasisElements(results: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Datengrundlage', value: results.dataBasis, type: 'text'},
      {title: 'Dokumentation (PDF)', value: this.apiBaseUrl + results.pdfUrl, displayText: results.pdfName ?? undefined, type: 'url'},
      {title: 'Bemerkungen', value: results.remarks, type: 'text'},
    ];
  }

  private extractDataProcurementElements(results: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Abgabeformat', value: results.outputFormat, type: 'text'},
      {title: 'Nutzungseinschränkungen', value: results.usageRestrictions, type: 'text'},
    ];
  }
}
