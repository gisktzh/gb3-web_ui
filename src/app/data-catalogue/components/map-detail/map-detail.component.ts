import {Component, computed} from '@angular/core';
import {MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {DataCatalogueDetailPageComponent} from '../data-catalogue-detail-page/data-catalogue-detail-page.component';
import {DataCatalogueDetailPageSectionComponent} from '../data-catalogue-detail-page-section/data-catalogue-detail-page-section.component';
import {DescriptiveHighlightedLinkComponent} from '../../../shared/components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {Gb2ExitButtonComponent} from '../../../shared/components/external-link-button/gb2-exit-button.component';
import {MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {DataDisplaySectionComponent} from '../data-display-section/data-display-section.component';
import {DataDisplayComponent} from '../data-display/data-display.component';
import {GenericUnorderedListComponent} from '../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';

interface BaseMetadataWithTopicInformation extends BaseMetadataInformation {
  topic: string;
}

@Component({
  selector: 'map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
  imports: [
    LoadingAndProcessBarComponent,
    DataCatalogueDetailPageComponent,
    DataCatalogueDetailPageSectionComponent,
    DescriptiveHighlightedLinkComponent,
    Gb2ExitButtonComponent,
    MatIconButton,
    RouterLink,
    MatIcon,
    DataDisplaySectionComponent,
    DataDisplayComponent,
    GenericUnorderedListComponent,
  ],
})
export class MapDetailComponent extends AbstractBaseDetailComponent<MapMetadata> {
  public readonly geodataContactElements = computed<DataDisplayElement[]>(() => {
    const baseDetailMetaData = this.baseDetailMetaData();
    return baseDetailMetaData ? DataExtractionUtils.extractContactElements(baseDetailMetaData.contact.geodata) : [];
  });
  public readonly linkedDatasets = computed<MetadataLink[]>(() => {
    const baseDetailMetaData = this.baseDetailMetaData();
    return baseDetailMetaData ? baseDetailMetaData.datasets : [];
  });
  public readonly gB2Url = computed<string | undefined>(() => this.baseDetailMetaData()?.gb2Url?.href);

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadMapDetail(id);
  }

  protected extractBaseMetadataInformation(mapMetadata: MapMetadata): BaseMetadataWithTopicInformation {
    return {
      itemTitle: mapMetadata.name,
      topic: mapMetadata.topic,
      category: 'GIS-Browser Karte',
      imageUrl: mapMetadata.imageUrl,
      shortDescription: mapMetadata.description,
    };
  }

  protected extractInformationElements(mapMetadata: MapMetadata): DataDisplayElement[] {
    return [
      {title: 'Nr.', value: mapMetadata.gisZHNr.toString(), type: 'text'},
      {title: 'Kartentyp', value: mapMetadata.gb2Url ? 'GB2' : 'GB3', type: 'text'},
      {
        title: 'Internet URL',
        value: mapMetadata.internetUrl ?? null,
        type: 'url',
      },
      {
        title: 'Intranet URL',
        value: mapMetadata.intranetUrl ?? null,
        type: 'url',
      },
      {title: 'Weiterführende Verweise', value: mapMetadata.externalLinks, type: 'urlList'},
    ];
  }
}
