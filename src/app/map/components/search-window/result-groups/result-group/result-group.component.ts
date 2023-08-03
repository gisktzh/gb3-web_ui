import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {SearchResultMatch} from '../../../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {Map} from '../../../../../shared/interfaces/topic.interface';
import {Store} from '@ngrx/store';
import {MAP_SERVICE} from '../../../../../app.module';
import {MapService} from '../../../../interfaces/map.service';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {SearchIndexType} from '../../../../../shared/types/search-index-type';
import {ActiveMapItemFactory} from '../../../../../shared/factories/active-map-item.factory';
import {selectMapConfigState} from '../../../../../state/map/reducers/map-config.reducer';
import {Subscription, tap} from 'rxjs';
import {MapConfigState} from '../../../../../state/map/states/map-config.state';

const DEFAULT_ZOOM_SCALE = 1000;

@Component({
  selector: 'result-group',
  templateUrl: './result-group.component.html',
  styleUrls: ['./result-group.component.scss'],
})
export class ResultGroupComponent implements OnInit, OnDestroy {
  @Input() public searchResults: SearchResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public type: SearchIndexType = 'default';
  @Input() public header: string = '';
  @Input() public searchTerms: string[] = [];

  public mapConfigState?: MapConfigState;
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

  public zoomToResult(searchResult: SearchResultMatch) {
    // only zoom to result if the geometry is available in the index
    if (searchResult.geometry) {
      const point = searchResult.geometry;
      this.mapService.zoomToPoint(point, DEFAULT_ZOOM_SCALE);
    }
  }

  public addActiveMap(activeMap: Map) {
    this.addActiveItem(ActiveMapItemFactory.createGb2WmsMapItem(activeMap));
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }
}
