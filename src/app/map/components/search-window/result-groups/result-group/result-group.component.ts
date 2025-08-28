import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren, inject} from '@angular/core';
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
import {ExpandableListItemComponent} from '../../../../../shared/components/expandable-list-item/expandable-list-item.component';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {MatRipple} from '@angular/material/core';
import {MatDivider} from '@angular/material/divider';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {DelayedMouseEnterDirective} from '../../../../../shared/directives/delayed-mouse-enter.directive';
import {HighlightSearchQueryPipe} from '../../../../../shared/pipes/highlight-search-query.pipe';
import {AppendMapConfigurationToUrlPipe} from '../../../../../shared/pipes/append-map-configuration-to-url.pipe';

@Component({
  selector: 'result-group',
  templateUrl: './result-group.component.html',
  styleUrls: ['./result-group.component.scss'],
  imports: [
    ExpandableListItemComponent,
    NgClass,
    MatRipple,
    SearchResultIdentifierDirective,
    MatDivider,
    MatTooltip,
    MatIcon,
    NgTemplateOutlet,
    DelayedMouseEnterDirective,
    HighlightSearchQueryPipe,
    AppendMapConfigurationToUrlPipe,
  ],
})
export class ResultGroupComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @ViewChildren(SearchResultIdentifierDirective) public readonly searchResultElements!: QueryList<SearchResultIdentifierDirective>;
  @Input() public searchResults: GeometrySearchApiResultMatch[] = [];
  @Input() public filteredMaps: Map[] = [];
  @Input() public header: string = '';
  @Input() public searchTerms: string[] = [];
  @Input() public isExpanded: boolean = false;

  public screenMode: ScreenMode = 'regular';
  public mapConfigState?: MapConfigState;
  public readonly hoverDelay = MapConstants.TEMPORARY_PREVIEW_DELAY;
  public readonly toolTip: string =
    'Diese Karte ist noch nicht im neuen GIS-Browser verfügbar. Öffnen Sie die Karte im alten GIS-Browser mit diesem Link.';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public selectSearchResult(searchResult: GeometrySearchApiResultMatch) {
    this.store.dispatch(SearchActions.selectMapSearchResult({searchResult}));
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
