import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {DatasetMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {catchError} from 'rxjs/operators';
import {DataDisplayElement} from '../../types/data-display-element';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

/**
 We do not get a description in the case of the dataset...
 */
type MetadataLinkWithoutDescription = Omit<MetadataLink, 'shortDescription'>;

interface MetadataLinkWithTopicId extends MetadataLinkWithoutDescription {
  topic: string;
}

@Component({
  selector: 'dataset-detail',
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss'],
})
export class DatasetDetailComponent implements OnInit, OnDestroy {
  public baseMetadataInformation?: BaseMetadataInformation;
  public informationElements: DataDisplayElement[] = [];
  public geodataContactElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public dataBasisElements: DataDisplayElement[] = [];
  public dataProcurement: DataDisplayElement[] = [];
  public linkedData: {
    maps: MetadataLinkWithTopicId[];
    services: MetadataLinkWithoutDescription[];
    products: MetadataLinkWithoutDescription[];
  } = {
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
            const id = params.get(RouteParamConstants.RESOURCE_IDENTIFIER);
            if (!id) {
              // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadDatasetDetail(id).pipe(
              catchError((err: unknown) => {
                this.loadingState = 'error';
                return throwError(() => err); // todo: forward to 404 page
              }),
            );
          }),
          tap((datasetMetadata) => {
            this.baseMetadataInformation = this.extractBaseMetadataInformation(datasetMetadata);
            this.informationElements = this.extractInformationElements(datasetMetadata);
            this.geodataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.geodata);
            this.metadataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.metadata);
            this.dataBasisElements = this.extractDataBasisElements(datasetMetadata);
            this.dataProcurement = this.extractDataProcurementElements(datasetMetadata);

            this.linkedData.maps = [...datasetMetadata.maps];
            this.linkedData.services = [...datasetMetadata.services];
            this.linkedData.products = [...datasetMetadata.products];
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractInformationElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: datasetMetadata.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: datasetMetadata.name, type: 'text'},
      {title: 'Kurzbeschreibung', value: datasetMetadata.shortDescription, type: 'text'},
      {title: 'Beschreibung', value: datasetMetadata.description, type: 'text'},
      {title: 'eCH Geokategorien / Themen', value: datasetMetadata.topics, type: 'text'},
      {title: 'Schlüsselwörter', value: datasetMetadata.keywords, type: 'text'},
    ];
  }

  private extractBaseMetadataInformation(datasetMetadata: DatasetMetadata): BaseMetadataInformation {
    return {
      itemTitle: datasetMetadata.name,
      shortDescription: datasetMetadata.description,
      keywords: ['Geodatensatz'], // todo: add OGD status once API delivers that
    };
  }

  private extractDataBasisElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Datengrundlage', value: datasetMetadata.dataBasis, type: 'text'},
      {
        title: 'Dokumentation (PDF)',
        value: datasetMetadata.pdfUrl ? this.apiBaseUrl + datasetMetadata.pdfUrl : null,
        displayText: datasetMetadata.pdfName ?? undefined,
        type: 'url',
      },
      {title: 'Bemerkungen', value: datasetMetadata.remarks, type: 'text'},
    ];
  }

  private extractDataProcurementElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Abgabeformat', value: datasetMetadata.outputFormat, type: 'text'},
      {title: 'Nutzungseinschränkungen', value: datasetMetadata.usageRestrictions, type: 'text'},
    ];
  }
}
