import {Component, OnDestroy, OnInit} from '@angular/core';
import {TitleLink} from '../shared/components/start-page-section/start-page-section.component';
import {LinksGroup} from '../shared/interfaces/links-group.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectLinks} from '../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
import {SearchActions} from '../state/app/actions/search.actions';
import {initialState, selectSearchState} from '../state/app/reducers/search.reducer';
import {SearchState} from '../state/app/states/search.state';
import {ConfigService} from '../shared/services/config.service';
import {PanelClass} from '../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {SearchFilterDialogComponent} from '../shared/components/search-filter-dialog/search-filter-dialog.component';
import {selectSearchResultObjects} from '../state/app/selectors/search-results.selector';
import {SearchResultObject} from '../shared/interfaces/search-result.interface';

const FILTER_DIALOG_WIDTH_IN_PX = 956;

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
  public searchResults: SearchResultObject[] = [];

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly usefulLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectLinks);
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly searchResults$ = this.store.select(selectSearchResultObjects);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.configService.searchConfig.startPage.filterGroups}));
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.clearSearch());
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.usefulLinksGroups$.pipe(tap((usefulLinks) => (this.usefulLinksGroups = usefulLinks))).subscribe());
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
    this.subscriptions.add(this.searchResults$.pipe(tap((searchResults) => (this.searchResults = searchResults))).subscribe());
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, group: this.searchConfig.searchOptions}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clearSearch());
  }

  public openFilterMenu() {
    this.dialogService.open<SearchFilterDialogComponent>(SearchFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      width: `${FILTER_DIALOG_WIDTH_IN_PX}px`,
    });
  }
}
