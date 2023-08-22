import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {Store} from '@ngrx/store';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {selectSearchApiLoadingState, selectTerm} from '../../../state/app/reducers/search.reducer';
import {selectFilteredMaps, selectFilteredSearchApiResultMatches} from '../../../state/app/selectors/search-results.selector';
import {Subscription, tap} from 'rxjs';
import {selectLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';

const FILTER_DIALOG_WIDTH_IN_PX = 956;

@Component({
  selector: 'start-page-search-overlay',
  templateUrl: './start-page-search-overlay.component.html',
  styleUrls: ['./start-page-search-overlay.component.scss'],
})
export class StartPageSearchOverlayComponent implements OnInit, OnDestroy {
  public searchTerms: string[] = [];
  public filteredMetadataMatches: SearchApiResultMatch[] = [];
  public filteredMaps: Map[] = [];
  public filteredFaqEntries: FaqCollection[] = [];
  public searchApiLoadingState: LoadingState = 'undefined';
  public layerCatalogLoadingState: LoadingState = 'undefined';

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly layerCatalogLoadingState$ = this.store.select(selectLoadingState);
  private readonly subscriptions: Subscription = new Subscription();
  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
    private readonly dialogRef: MatDialogRef<StartPageSearchOverlayComponent>,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig.searchOptions}));
  }

  public close() {
    this.dialogRef.close();
  }

  public openFilterMenu() {
    this.dialogService.open<SearchFilterDialogComponent>(SearchFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      width: `${FILTER_DIALOG_WIDTH_IN_PX}px`,
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(this.searchTerm$.pipe(tap((searchTerm) => (this.searchTerms = searchTerm.split(' ')))).subscribe());
    this.subscriptions.add(this.filteredMaps$.pipe(tap((filteredMaps) => (this.filteredMaps = filteredMaps))).subscribe());
    this.subscriptions.add(
      this.filteredSearchApiResultMatches$
        .pipe(
          tap((filteredSearchApiResultMatches) => {
            const filteredMetadataMatches: SearchApiResultMatch[] = [];
            filteredSearchApiResultMatches.forEach((resultMatch) => {
              if (resultMatch.indexType) {
                switch (resultMatch.indexType) {
                  case 'metadata-maps':
                  case 'metadata-products':
                  case 'metadata-datasets':
                  case 'metadata-services':
                    filteredMetadataMatches.push(resultMatch);
                    break;
                  case 'addresses':
                  case 'places':
                  case 'activeMapItems':
                    // ignore
                    break;
                }
              }
            });
            this.filteredMetadataMatches = filteredMetadataMatches;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.searchApiLoadingState$.pipe(tap((searchApiLoadingState) => (this.searchApiLoadingState = searchApiLoadingState))).subscribe(),
    );
    this.subscriptions.add(
      this.layerCatalogLoadingState$
        .pipe(tap((layerCatalogLoadingState) => (this.layerCatalogLoadingState = layerCatalogLoadingState)))
        .subscribe(),
    );
  }
}
