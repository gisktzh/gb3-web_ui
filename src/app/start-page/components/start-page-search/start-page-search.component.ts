import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {Map} from '../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FaqItem} from '../../../shared/interfaces/faq.interface';
import {selectSearchApiLoadingState, selectTerm} from '../../../state/app/reducers/search.reducer';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
} from '../../../state/app/selectors/search-results.selector';
import {Subscription, tap} from 'rxjs';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {selectLoadingState as selectDataCatalogLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {selectActiveSearchFilterValues} from '../../../state/data-catalogue/selectors/active-search-filters.selector';

const FILTER_DIALOG_WIDTH_IN_PX = 956;

@Component({
  selector: 'start-page-search',
  templateUrl: './start-page-search.component.html',
  styleUrls: ['./start-page-search.component.scss'],
})
export class StartPageSearch implements OnInit, OnDestroy {
  public searchTerms: string[] = [];
  public filteredMetadataItems: OverviewMetadataItem[] = [];
  public filteredMaps: Map[] = [];
  public filteredFaqItems: FaqItem[] = [];
  public combinedSearchAndDataCatalogLoadingState: LoadingState = undefined;
  public layerCatalogLoadingState: LoadingState = undefined;
  public searchApiLoadingState: LoadingState = undefined;
  public dataCatalogLoadingState: LoadingState = undefined;
  public activeSearchFilterValues: {groupLabel: string; filterLabel: string}[] = [];

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly activeSearchFilterValues$ = this.store.select(selectActiveSearchFilterValues);
  private readonly filteredMetadataItems$ = this.store.select(selectFilteredMetadataItems);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly layerCatalogLoadingState$ = this.store.select(selectLayerCatalogLoadingState);
  private readonly dataCatalogLoadingState$ = this.store.select(selectDataCatalogLoadingState);
  private readonly filteredFaqItems$ = this.store.select(selectFilteredFaqItems);
  private readonly subscriptions: Subscription = new Subscription();
  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig.searchOptions}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clearSearchTerm());
  }

  public deactivateFilter(groupLabel: string, filterLabel: string) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive: false}));
  }

  public openFilterMenu() {
    this.dialogService.open<SearchFilterDialogComponent>(SearchFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      width: `${FILTER_DIALOG_WIDTH_IN_PX}px`,
    });
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
        )
        .subscribe(),
    );
    this.subscriptions.add(this.filteredMaps$.pipe(tap((filteredMaps) => (this.filteredMaps = filteredMaps))).subscribe());
    this.subscriptions.add(
      this.filteredMetadataItems$.pipe(tap((filteredMetadataItems) => (this.filteredMetadataItems = filteredMetadataItems))).subscribe(),
    );
    this.subscriptions.add(
      this.searchApiLoadingState$
        .pipe(
          tap((searchApiLoadingState) => {
            this.searchApiLoadingState = searchApiLoadingState;
            this.updateCombinedSearchAndDataCatalogLoadingState();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.layerCatalogLoadingState$
        .pipe(tap((layerCatalogLoadingState) => (this.layerCatalogLoadingState = layerCatalogLoadingState)))
        .subscribe(),
    );
    this.subscriptions.add(
      this.dataCatalogLoadingState$
        .pipe(
          tap((dataCatalogLoadingState) => {
            this.dataCatalogLoadingState = dataCatalogLoadingState;
            this.updateCombinedSearchAndDataCatalogLoadingState();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.filteredFaqItems$.pipe(tap((filteredFaqItems) => (this.filteredFaqItems = filteredFaqItems))).subscribe());
    this.subscriptions.add(
      this.activeSearchFilterValues$
        .pipe(tap((activeSearchFilterValues) => (this.activeSearchFilterValues = activeSearchFilterValues)))
        .subscribe(),
    );
  }

  private updateCombinedSearchAndDataCatalogLoadingState() {
    if (this.dataCatalogLoadingState === 'error' || this.searchApiLoadingState === 'error') {
      this.combinedSearchAndDataCatalogLoadingState = 'error';
    } else if (this.dataCatalogLoadingState === 'loaded' && this.searchApiLoadingState === 'loaded') {
      this.combinedSearchAndDataCatalogLoadingState = 'loaded';
    } else if (this.dataCatalogLoadingState === 'loading' || this.searchApiLoadingState === 'loading') {
      this.combinedSearchAndDataCatalogLoadingState = 'loading';
    } else {
      this.combinedSearchAndDataCatalogLoadingState = undefined;
    }
  }
}
