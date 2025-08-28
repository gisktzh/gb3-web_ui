import {Component} from '@angular/core';
import {DatasetMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {DatasetLayer} from '../../../shared/interfaces/dataset-layer.interface';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {DataCatalogueDetailPageComponent} from '../data-catalogue-detail-page/data-catalogue-detail-page.component';
import {DataCatalogueDetailPageSectionComponent} from '../data-catalogue-detail-page-section/data-catalogue-detail-page-section.component';
import {DataDisplaySectionComponent} from '../data-display-section/data-display-section.component';
import {DataDisplayComponent} from '../data-display/data-display.component';
import {DatasetElementDetailComponent} from './dataset-element-detail/dataset-element-detail.component';
import {GenericUnorderedListComponent} from '../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';
import {DescriptiveHighlightedLinkComponent} from '../../../shared/components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

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
  imports: [
    LoadingAndProcessBarComponent,
    DataCatalogueDetailPageComponent,
    DataCatalogueDetailPageSectionComponent,
    DataDisplaySectionComponent,
    DataDisplayComponent,
    DatasetElementDetailComponent,
    GenericUnorderedListComponent,
    DescriptiveHighlightedLinkComponent,
    RouterLink,
    MatButton,
    MatIcon,
  ],
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
      imageUrl: null,
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
      {title: 'Bezugsart', value: datasetMetadata.ogd ? 'OGD-Daten (kostenlos)' : 'NOGD-Daten', type: 'text'},
      {
        title: 'Link',
        value: {
          href: datasetMetadata.ogd ? 'https://geolion.zh.ch/OGDZH_DatenGisBrowser_2024.pdf' : 'https://geodatenshop.zh.ch',
          title: datasetMetadata.ogd ? 'OGD Anleitung PDF' : 'NOGD Geodatenshop',
        },
        type: 'url',
      },
    ];
  }

  private extractGeospatialElements(datasetMetadata: DatasetMetadata): DataDisplayElement[] {
    return [
      {title: 'Geographisches Gebiet / Ausdehnung', value: datasetMetadata.scope, type: 'text'},
      {title: 'Referenzsystem ', value: 'CH1903+_LV95', type: 'text'},

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
