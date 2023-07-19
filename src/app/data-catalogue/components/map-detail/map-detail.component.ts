import {Component, OnDestroy, OnInit} from '@angular/core';
import {MapMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, switchMap, tap, throwError} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {DataDisplayElement} from '../data-display/data-display.component';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DataCataloguePage} from '../../../shared/enums/data-catalogue-page.enum';
import {BaseMetadataInformation} from '../../../shared/interfaces/base-metadata-information.interface';
import {MetadataLink} from '../../../shared/interfaces/metadata-link.interface';
import {DataExtractionUtils} from '../../utils/data-extraction.utils';

interface BaseMetadataWithTopicInformation extends BaseMetadataInformation {
  topic: string;
}

@Component({
  selector: 'map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
})
export class MapDetailComponent implements OnInit, OnDestroy {
  public baseMetadataInformation: BaseMetadataWithTopicInformation | undefined;
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
            const id = params.get('id');
            if (!id) {
              return throwError(() => new Error('No id specified'));
            }
            return this.gb3MetadataService.loadMapDetail(id);
          }),
          tap((results) => {
            this.baseMetadataInformation = this.extractBaseMetadataInformation(results);
            this.geodataContactElements = DataExtractionUtils.extractContactElements(results.contact.geodata);
            this.informationElements = this.extractInformationElements(results);
            this.linkedDatasets = results.datasets;
            this.loadingState = 'loaded';
          }),
        )
        .subscribe(),
    );
  }

  private extractBaseMetadataInformation(results: MapMetadata): BaseMetadataWithTopicInformation {
    return {
      itemTitle: results.name,
      topic: results.topic,
      keywords: ['GIS-Browser Karte'], // todo: add OGD status once API delivers that
    };
  }

  private extractInformationElements(data: MapMetadata): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: data.guid.toString(), type: 'text'},
      {title: 'Bezeichnung', value: data.name, type: 'text'},
      {title: 'Beschreibung', value: data.description, type: 'text'},
    ];
  }
}
