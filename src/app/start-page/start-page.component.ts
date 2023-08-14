import {Component, OnDestroy, OnInit} from '@angular/core';
import {TitleLink} from '../shared/components/start-page-section/start-page-section.component';
import {LinksGroup} from '../shared/interfaces/links-group.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectLinks} from '../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
import {DEFAULT_SEARCHES, MAP_SEARCH} from '../shared/constants/search.constants';
import {LayerCatalogActions} from '../state/map/actions/layer-catalog.actions';
import {SearchActions} from '../state/app/actions/search.actions';
import {initialState, selectSearchState} from '../state/app/reducers/search.reducer';
import {SearchState} from '../state/app/states/search.state';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent implements OnInit, OnDestroy {
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge',
  };
  public usefulLinksGroups: LinksGroup[] = [];
  public searchState: SearchState = initialState;

  private readonly usefulLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectLinks);
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {
    // load the maps/layers for the search
    this.store.dispatch(LayerCatalogActions.loadLayerCatalog());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.usefulLinksGroups$.pipe(tap((usefulLinks) => (this.usefulLinksGroups = usefulLinks))).subscribe());
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchTermAndIndexes({term, indexes: DEFAULT_SEARCHES.concat(MAP_SEARCH)}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clear());
  }

  public openFilterMenu() {
    console.log('open filter menu');
  }
}
