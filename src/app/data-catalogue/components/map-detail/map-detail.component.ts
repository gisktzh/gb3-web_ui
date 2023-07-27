import {Component, Inject} from '@angular/core';
import {MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../../types/data-display-element';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {AbstractBaseDetailComponent} from '../abstract-base-detail/abstract-base-detail.component';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {ErrorHandlerService} from '../../../error-handling/error-handler.service';

interface BaseMetadataWithTopicInformation extends BaseMetadataInformation {
  topic: string;
}

@Component({
  selector: 'map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
})
export class MapDetailComponent extends AbstractBaseDetailComponent<MapMetadata> {
  public baseMetadataInformation?: BaseMetadataWithTopicInformation;
  public informationElements: DataDisplayElement[] = [];
  public geodataContactElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];

  constructor(
    @Inject(ActivatedRoute) route: ActivatedRoute,
    @Inject(Gb3MetadataService) gb3MetadataService: Gb3MetadataService,
    @Inject(ConfigService) configService: ConfigService,
    @Inject(Router) router: Router,
    @Inject(ErrorHandlerService) errorHandlerService: ErrorHandlerService,
  ) {
    super(route, gb3MetadataService, configService, router, errorHandlerService);
  }

  protected loadMetadata(id: string) {
    return this.gb3MetadataService.loadMapDetail(id);
  }

  protected handleMetadata(mapMetadata: MapMetadata) {
    this.baseMetadataInformation = this.extractBaseMetadataInformation(mapMetadata);
    this.informationElements = this.extractInformationElements(mapMetadata);
    this.geodataContactElements = DataExtractionUtils.extractContactElements(mapMetadata.contact.geodata);
    this.linkedDatasets = mapMetadata.datasets;
  }

  private extractBaseMetadataInformation(mapMetadata: MapMetadata): BaseMetadataWithTopicInformation {
    return {
      itemTitle: mapMetadata.name,
      topic: mapMetadata.topic,
      keywords: ['GIS-Browser Karte'], // todo: add OGD status once API delivers that
    };
  }

  private extractInformationElements(mapMetadata: MapMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: mapMetadata.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: mapMetadata.name, type: 'text'},
      {title: 'Beschreibung', value: mapMetadata.description, type: 'text'},
    ];
  }
}
