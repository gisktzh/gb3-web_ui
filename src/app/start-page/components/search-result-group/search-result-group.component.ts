import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {Store} from '@ngrx/store';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {selectMapConfigState} from '../../../state/map/reducers/map-config.reducer';
import {Subscription, tap} from 'rxjs';
import {MapConfigState} from '../../../state/map/states/map-config.state';
import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {MainPage} from '../../../shared/enums/main-page.enum';

@Component({
  selector: 'search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrls: ['./search-result-group.component.scss'],
})
export class SearchResultGroupComponent implements OnInit, OnDestroy {
  @Input() public header: string = '';
  @Input() public filteredSearchResults: SearchApiResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public filteredFaqEntries: FaqCollection[] = [];
  @Input() public searchTerms: string[] = [];

  public mapConfigState?: MapConfigState;
  protected readonly mainPageEnum = MainPage;
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.mapConfigState$
        .pipe(
          tap((mapConfigState) => {
            this.mapConfigState = mapConfigState;
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public zoomToResult(searchResult: SearchApiResultMatch) {
    // only zoom to result if the geometry is available in the index
    if (searchResult.geometry) {
      this.mapService.zoomToExtent(searchResult.geometry);
    }
  }

  public addActiveMap(activeMap: Map) {
    const activeMapItem = ActiveMapItemFactory.createGb2WmsMapItem(activeMap);
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }
}
