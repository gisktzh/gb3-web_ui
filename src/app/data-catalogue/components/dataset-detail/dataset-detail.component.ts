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
import {DatasetLayer} from '../../../shared/interfaces/dataset-layer.interface';
import {Store} from '@ngrx/store';

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
  public geoSpatialElements: DataDisplayElement[] = [];
  public updateElements: DataDisplayElement[] = [];
  public legislationElements: DataDisplayElement[] = [];
  public geodataContactElements: DataDisplayElement[] = [];
  public externalLinksElements: DataDisplayElement[] = [];
  public arcGISElements: DataDisplayElement[] = [];
  public metadataContactElements: DataDisplayElement[] = [];
  public dataBasisElements: DataDisplayElement[] = [];
  public dataProcurement: DataDisplayElement[] = [];
  public datasetLayers: DatasetLayer[] = [];
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
    @Inject(Store) store: Store,
  ) {
    super(route, gb3MetadataService, configService, router, errorHandler, store);
  }

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadDatasetDetail(id);
  }

  protected handleMetadata(datasetMetadata: DatasetMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(datasetMetadata);
    this.informationElements = this.extractInformationElements(datasetMetadata);
    this.geoSpatialElements = this.extractGeospatialElements(datasetMetadata);
    this.updateElements = this.extractUpdateElements(datasetMetadata);
    this.legislationElements = this.extractLegislationElements(datasetMetadata);
    this.geodataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.geodata);
    this.metadataContactElements = DataExtractionUtils.extractContactElements(datasetMetadata.contact.metadata);
    this.dataBasisElements = this.extractDataBasisElements(datasetMetadata);
    this.dataProcurement = this.extractDataProcurementElements(datasetMetadata);
    this.externalLinksElements = this.extractExternalLinkElements(datasetMetadata);
    this.arcGISElements = this.extractArcGISElements(datasetMetadata);

    this.datasetLayers = datasetMetadata.layers;
    this.linkedData.maps = [...datasetMetadata.maps];
    this.linkedData.services = [...datasetMetadata.services];
    this.linkedData.products = [...datasetMetadata.products];
  }

  private extractBaseMetadataInformation(datasetMetadata: DatasetMetadata): BaseMetadataInformation {
    return {
      itemTitle: datasetMetadata.name,
      shortDescription: datasetMetadata.description,
      category: 'Geodatensatz',
    };
  }

  private extractInformationElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: datasetMetadata.gisZHNr.toString(), type: 'text'},
      {title: 'eCH Geokategorien / Themen', value: datasetMetadata.topics, type: 'textList'},
      {title: 'Schlüsselwörter', value: datasetMetadata.keywords, type: 'textList'},
    ];
  }

  private extractDataBasisElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Datenerfassung', value: datasetMetadata.dataCapture, type: 'text'},

      {title: 'Datengrundlage', value: datasetMetadata.dataBasis, type: 'text'},
      {
        title: 'Dokumentation (PDF)',
        value: datasetMetadata.pdf ?? null,
        type: 'url',
      },
      {title: 'Bemerkungen', value: datasetMetadata.remarks, type: 'text'},
    ];
  }

  private extractDataProcurementElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Abgabeformat', value: datasetMetadata.outputFormat, type: 'textList'},
      {title: 'Bezugsart', value: datasetMetadata.ogd ? 'OGD-Daten (kostenlos)' : 'NOGD-Daten (kostenpflichtig)', type: 'text'},
      {
        title: 'Link',
        value: {
          href: datasetMetadata.ogd ? 'https://www.bfs.admin.ch/bfsstatic/dam/assets/13267666/master' : 'https://geodatenshop.zh.ch',
          title: datasetMetadata.ogd ? 'OGD Anleitung PDF' : 'NOGD Geodatenshop',
        },
        type: 'url',
      },
    ];
  }

  private extractGeospatialElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Geographisches Gebiet / Ausdehnung', value: datasetMetadata.scope, type: 'text'},
      {title: 'Referenzsystem ', value: 'CH1903+_LV95', type: 'text'}, // TODO GBS-834: Value not delivered

      {title: 'Erfassungsmassstab', value: datasetMetadata.scale ? `1:${datasetMetadata.scale.toString()}` : null, type: 'text'},
      {
        title: 'Lagegenauigkeit',
        value: datasetMetadata.positionAccuracy ? `${datasetMetadata.positionAccuracy.toString()} [m]` : null,
        type: 'text',
      },
      {title: 'Auflösung', value: datasetMetadata.resolution ? `${datasetMetadata.resolution.toString()} [m]` : null, type: 'text'},
    ];
  }

  private extractUpdateElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Geodaten aktueller Stand', value: datasetMetadata.dataStatus, type: 'text'},
      {title: 'Nachführungstyp ', value: datasetMetadata.updateType, type: 'text'},
      {title: 'Bearbeitungsstatus', value: datasetMetadata.editingStatus, type: 'text'},
    ];
  }

  private extractLegislationElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Geobasisdaten Klasse', value: datasetMetadata.statuteClass, type: 'text'},
      {
        title: 'Geobasisdaten ID',
        value: datasetMetadata.geoBaseData ?? null,
        type: 'url',
      },
    ];
  }

  private extractExternalLinkElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {
        title: 'Geocat',
        value: datasetMetadata.geocat ?? null,
        type: 'url',
      },
      {
        title: 'OpendataSwiss',
        value: datasetMetadata.opendataSwiss ?? null,
        type: 'url',
      },
    ];
  }

  private extractArcGISElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {
        title: 'ArcMap .mxd',
        value: datasetMetadata.mxd ?? null,
        type: 'url',
      },
      {
        title: 'ArcMap .lyr',
        value: datasetMetadata.lyr,
        type: 'urlList',
      },
    ];
  }
}
