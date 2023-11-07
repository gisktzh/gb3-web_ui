import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {FaqItem} from 'src/app/shared/interfaces/faq.interface';
import {OverviewMetadataItem} from 'src/app/shared/models/overview-metadata-item.model';
import {ConfigService} from 'src/app/shared/services/config.service';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectSearchApiLoadingState} from 'src/app/state/app/reducers/search.reducer';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
} from '../../../../state/app/selectors/search-results.selector';
import {selectLoadingState as selectDataCatalogLoadingState} from '../../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../../../state/map/reducers/layer-catalog.reducer';

@Component({
  selector: 'search-result-groups',
  templateUrl: './search-result-groups.component.html',
  styleUrls: ['./search-result-groups.component.scss'],
})
export class SearchResultGroupsComponent implements OnInit, OnDestroy {
  public layerCatalogLoadingState: LoadingState;
  public filteredMaps: Map[] = [];
  public filteredMetadataItems: OverviewMetadataItem[] = [];
  public filteredFaqItems: FaqItem[] = [];
  public dataCatalogLoadingState: LoadingState;
  public combinedSearchAndDataCatalogLoadingState: LoadingState;
  public searchApiLoadingState: LoadingState;
  public screenMode: ScreenMode = 'regular';

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly layerCatalogLoadingState$ = this.store.select(selectLayerCatalogLoadingState);
  private readonly dataCatalogLoadingState$ = this.store.select(selectDataCatalogLoadingState);
  private readonly filteredFaqItems$ = this.store.select(selectFilteredFaqItems);
  private readonly filteredMetadataItems$ = this.store.select(selectFilteredMetadataItems);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.filteredMaps$.pipe(tap((filteredMaps) => (this.filteredMaps = filteredMaps))).subscribe());
    this.subscriptions.add(
      this.filteredMetadataItems$.pipe(tap((filteredMetadataItems) => (this.filteredMetadataItems = filteredMetadataItems))).subscribe(),
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
    this.subscriptions.add(this.filteredFaqItems$.pipe(tap((filteredFaqItems) => (this.filteredFaqItems = filteredFaqItems))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
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
