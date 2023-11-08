import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MAP_SERVICE} from '../../../../../app.module';
import {ActiveMapItemFactory} from '../../../../../shared/factories/active-map-item.factory';
import {Map} from '../../../../../shared/interfaces/topic.interface';
import {GeometrySearchApiResultMatch} from '../../../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {selectMapConfigState} from '../../../../../state/map/reducers/map-config.reducer';
import {MapConfigState} from '../../../../../state/map/states/map-config.state';
import {MapService} from '../../../../interfaces/map.service';
import {ActiveMapItem} from '../../../../models/active-map-item.model';

@Component({
  selector: 'result-group',
  templateUrl: './result-group.component.html',
  styleUrls: ['./result-group.component.scss'],
})
export class ResultGroupComponent implements OnInit, OnDestroy {
  @Input() public searchResults: GeometrySearchApiResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public header: string = '';
  @Input() public searchTerms: string[] = [];

  public screenMode: ScreenMode = 'regular';
  public mapConfigState?: MapConfigState;

  private readonly scrennMode$ = this.store.select(selectScreenMode);
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public zoomToResult(searchResult: GeometrySearchApiResultMatch) {
    // only zoom to result if the geometry is available in the index
    if (searchResult.geometry) {
      this.mapService.zoomToExtent(searchResult.geometry);
    }
  }

  public addActiveMap(activeMap: Map) {
    this.addActiveItem(ActiveMapItemFactory.createGb2WmsMapItem(activeMap));
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }

  public initSubscriptions() {
    this.subscriptions.add(this.scrennMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }
}
