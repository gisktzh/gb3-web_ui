import {Component, ErrorHandler, Inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {DatasetMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';

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
export class DatasetDetailComponent extends AbstractBaseDetailComponent<DatasetMetadata> {
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

  constructor(
    @Inject(ActivatedRoute) route: ActivatedRoute,
    @Inject(Gb3MetadataService) gb3MetadataService: Gb3MetadataService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(Router) router: Router,
    @Inject(ErrorHandler) errorHandler: ErrorHandler,
  ) {
    super(route, gb3MetadataService, configService, router, errorHandler);
  }

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadDatasetDetail(id);
  }

  protected handleMetadata(datasetMetadata: DatasetMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(datasetMetadata);
    this.informationElements = this.extractInformationElements(datasetMetadata);
    this.geodataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.geodata);
    this.metadataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.metadata);
    this.dataBasisElements = this.extractDataBasisElements(datasetMetadata);
    this.dataProcurement = this.extractDataProcurementElements(datasetMetadata);

    this.linkedData.maps = [...datasetMetadata.maps];
    this.linkedData.services = [...datasetMetadata.services];
    this.linkedData.products = [...datasetMetadata.products];
  }

  private extractBaseMetadataInformation(datasetMetadata: DatasetMetadata): BaseMetadataInformation {
    return {
      itemTitle: datasetMetadata.name,
      shortDescription: datasetMetadata.description,
      keywords: ['Geodatensatz'], // todo: add OGD status once API delivers that
    };
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
