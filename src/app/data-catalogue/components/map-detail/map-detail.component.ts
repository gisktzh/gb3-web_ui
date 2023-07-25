import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';
import {catchError} from 'rxjs/operators';
import {DataDisplayElement} from '../../types/data-display-element';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';

interface BaseMetadataWithTopicInformation extends BaseMetadataInformation {
  topic: string;
}

@Component({
  selector: 'map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
})
export class MapDetailComponent implements OnInit, OnDestroy {
  public baseMetadataInformation?: BaseMetadataWithTopicInformation;
  public geodataContactElements: DataDisplayElement[] = [];
  public informationElements: DataDisplayElement[] = [];
  public linkedDatasets: MetadataLink[] = [];
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
            const id = params.get(RouteParamConstants.RESOURCE_IDENTIFIER);
            if (!id) {
              // note: this can never happen since the :id always matches - but Angular does not know typed URL parameters.
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadMapDetail(id).pipe(
              catchError((err: unknown) => {
                this.loadingState = 'error';
                return throwError(() => err); // todo: forward to 404 page
              }),
            );
          }),
          tap((mapMetadata) => {
            this.baseMetadataInformation = this.extractBaseMetadataInformation(mapMetadata);
            this.geodataContactElements = DataExtractionUtils.extractContactElements(mapMetadata.contact.geodata);
            this.informationElements = this.extractInformationElements(mapMetadata);
            this.linkedDatasets = mapMetadata.datasets;
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
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
