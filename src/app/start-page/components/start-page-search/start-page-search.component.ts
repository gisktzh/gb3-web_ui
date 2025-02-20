import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, QueryList, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatestWith, filter, switchMap, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectTerm} from '../../../state/app/reducers/search.reducer';
import {selectActiveSearchFilterValues} from '../../../state/data-catalogue/selectors/active-search-filters.selector';
import {SearchResultGroupsComponent} from './search-result-groups/search-result-groups.component';
import {SearchResultIdentifierDirective} from '../../../shared/directives/search-result-identifier.directive';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredUsefulLinks,
} from '../../../state/app/selectors/search-results.selector';
import {BaseSearchContainerComponent} from '../../../shared/components/search/base-search-container/base-search-container.component';

@Component({
  selector: 'start-page-search',
  templateUrl: './start-page-search.component.html',
  styleUrls: ['./start-page-search.component.scss'],
  standalone: false,
})
export class StartPageSearchComponent extends BaseSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(SearchResultGroupsComponent) private readonly searchResultGroupsComponent?: SearchResultGroupsComponent;

  public searchTerms: string[] = [];
  public activeSearchFilterValues: {groupLabel: string; filterLabel: string}[] = [];
  public screenMode: ScreenMode = 'regular';
  public readonly searchConfig = this.configService.searchConfig.startPage;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly activeSearchFilterValues$ = this.store.select(selectActiveSearchFilterValues);

  constructor(
    private readonly configService: ConfigService,
    @Inject(Store) store: Store,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(store, cdr);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.unsubscribe();
  }

  public override ngAfterViewInit() {
    super.ngAfterViewInit();
    // Necessary because we are passing the searchComponent to the searchResultKeyboardNavigation directive
    this.cdr.detectChanges();
  }

  public deactivateFilter(groupLabel: string, filterLabel: string) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.searchTerm$
        .pipe(
          tap((searchTerm) => {
            if (searchTerm === '') {
              this.searchTerms = [];
            } else {
              this.searchTerms = searchTerm.split(' ');
            }
          }),
          combineLatestWith(
            this.store.select(selectFilteredFaqItems),
            this.store.select(selectFilteredUsefulLinks),
            this.store.select(selectFilteredMetadataItems),
            this.store.select(selectFilteredLayerCatalogMaps),
          ),
          filter(() => this.searchResultGroupsComponent !== undefined),
          switchMap(() => this.searchResultGroupsComponent!.overviewSearchResultItemComponents.changes),
          tap((overviewChanges: QueryList<SearchResultIdentifierDirective>) => {
            this.allSearchResults = overviewChanges.toArray();
            this.cdr.detectChanges(); // Trigger change detection to reflect updates in the template
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.activeSearchFilterValues$
        .pipe(tap((activeSearchFilterValues) => (this.activeSearchFilterValues = activeSearchFilterValues)))
        .subscribe(),
    );
  }
}
