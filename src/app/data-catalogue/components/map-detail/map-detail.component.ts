import {Component, ErrorHandler, Inject} from '@angular/core';
import {MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {Store} from '@ngrx/store';

interface BaseMetadataWithTopicInformation extends BaseMetadataInformation {
  topic: string;
}

@Component({
  selector: 'map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
  standalone: false,
})
export class MapDetailComponent extends AbstractBaseDetailComponent<MapMetadata> {
  public baseMetadataInformation?: BaseMetadataWithTopicInformation;
  public informationElements: DataDisplayElement[] = [];
  public geodataContactElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];
  public gB2Url?: string;

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
    return this.gb3MetadataService.loadMapDetail(id);
  }

  protected handleMetadata(mapMetadata: MapMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(mapMetadata);
    this.informationElements = this.extractInformationElements(mapMetadata);
    this.geodataContactElements = DataExtractionUtils.extractContactElements(mapMetadata.contact.geodata);
    this.linkedDatasets = mapMetadata.datasets;
    this.gB2Url = mapMetadata.gb2Url?.href;
  }

  private extractBaseMetadataInformation(mapMetadata: MapMetadata): BaseMetadataWithTopicInformation {
    return {
      itemTitle: mapMetadata.name,
      topic: mapMetadata.topic,
      category: 'GIS-Browser Karte',
      imageUrl: mapMetadata.imageUrl,
      shortDescription: mapMetadata.description,
    };
  }

  private extractInformationElements(mapMetadata: MapMetadata): DataDisplayElement[] {
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
