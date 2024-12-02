import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItemFactory} from '../../../../../shared/factories/active-map-item.factory';
import {Map} from '../../../../../shared/interfaces/topic.interface';
import {GeometrySearchApiResultMatch} from '../../../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {selectMapConfigState} from '../../../../../state/map/reducers/map-config.reducer';
import {MapConfigState} from '../../../../../state/map/states/map-config.state';
import {ActiveMapItem} from '../../../../models/active-map-item.model';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {SearchActions} from '../../../../../state/app/actions/search.actions';
import {SearchResultIdentifierDirective} from '../../../../../shared/directives/search-result-identifier.directive';

@Component({
  selector: 'result-group',
  templateUrl: './result-group.component.html',
  styleUrls: ['./result-group.component.scss'],
  standalone: false,
})
export class ResultGroupComponent implements OnInit, OnDestroy {
  @ViewChildren(SearchResultIdentifierDirective) public readonly searchResultElement!: QueryList<SearchResultIdentifierDirective>;
  @Input() public searchResults: GeometrySearchApiResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public header: string = '';
  @Input() public searchTerms: string[] = [];
  @Input() public isExpanded: boolean = false;

  public screenMode: ScreenMode = 'regular';
  public mapConfigState?: MapConfigState;
  public readonly hoverDelay = MapConstants.TEMPORARY_PREVIEW_DELAY;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public selectSearchResult(searchResult: GeometrySearchApiResultMatch) {
    this.store.dispatch(SearchActions.selectMapSearchResult({searchResult}));
  }

  public parentClick(map: Map) {
    const index = this.filteredMaps.indexOf(map);
    const item = this.searchResultElement.toArray()[index];
    if (!item) {
      return;
    }
    if (map.gb2Url) {
      const gb2 = item.host.nativeElement.firstElementChild?.firstElementChild as HTMLAnchorElement;
      gb2.click();
    } else {
      const button = item.host.nativeElement.firstElementChild as HTMLButtonElement;
      button.click();
    }
  }

  public addActiveMap(activeMap: Map, isTemporary: boolean = false) {
    if (!activeMap.gb2Url) {
      this.addActiveItem(
        isTemporary ? ActiveMapItemFactory.createTemporaryGb2WmsMapItem(activeMap) : ActiveMapItemFactory.createGb2WmsMapItem(activeMap),
      );
    }
  }

  public removeTemporaryMap(activeMap: Map) {
    if (!activeMap.gb2Url) {
      const item = ActiveMapItemFactory.createTemporaryGb2WmsMapItem(activeMap);
      this.store.dispatch(ActiveMapItemActions.removeTemporaryActiveMapItem({activeMapItem: item}));
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  private addActiveItem(activeMapItem: ActiveMapItem) {
    // add new map items on top (position 0)
    this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
  }
}
