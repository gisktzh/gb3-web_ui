import {AfterViewInit, Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter, Observable, Subject, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {selectLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {selectDataCatalogueItems} from '../../../state/data-catalogue/selectors/data-catalogue-items.selector';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {DataCatalogueFilterDialogComponent} from '../data-catalogue-filter-dialog/data-catalogue-filter-dialog.component';
import {ActiveDataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {selectActiveFilterValues} from '../../../state/data-catalogue/selectors/active-filter-values.selector';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {ConfigService} from '../../../shared/services/config.service';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {OverviewSearchResultDisplayItem} from '../../../shared/interfaces/overview-search-resuilt-display.interface';

const GEO_DATA_CATALOGUE_SUMMARY =
  'Im Geodatenkatalog finden Sie Informationen zur Herkunft, Aktualität und Genauigkeit der Daten, Hinweise zur Nutzung und zum Datenbezug.';

@Injectable()
class DataCataloguePaginatorIntl implements MatPaginatorIntl {
  public readonly changes: Subject<void> = new Subject<void>();
  public firstPageLabel: string = 'Erste Seite';
  public itemsPerPageLabel: string = 'Einträge pro Seite';
  public lastPageLabel: string = 'Letzte Seite';
  public nextPageLabel: string = 'Nächste Seite';
  public previousPageLabel: string = 'Vorherige Seite';

  public getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.getRangeLabelText(1, 1);
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.getRangeLabelText(page + 1, amountPages);
  }

  private getRangeLabelText(currentPage: number, amountPages: number): string {
    return `Seite ${currentPage} von ${amountPages}`;
  }
}

@Component({
  selector: 'data-catalogue-overview',
  templateUrl: './data-catalogue-overview.component.html',
  styleUrls: ['./data-catalogue-overview.component.scss'],
  providers: [{provide: MatPaginatorIntl, useClass: DataCataloguePaginatorIntl}],
  standalone: false,
})
export class DataCatalogueOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  public loadingState: LoadingState;
  public dataCatalogueItems: MatTableDataSource<OverviewSearchResultDisplayItem> = new MatTableDataSource<OverviewSearchResultDisplayItem>(
    [],
  );
  public activeFilters: ActiveDataCatalogueFilter[] = [];
  public screenMode: ScreenMode = 'regular';
  public heroText = GEO_DATA_CATALOGUE_SUMMARY;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly searchConfig = this.configService.searchConfig.dataCatalogPage;
  private readonly activeFilters$: Observable<ActiveDataCatalogueFilter[]> = this.store.select(selectActiveFilterValues);
  private readonly dataCatalogueItems$: Observable<OverviewSearchResultDisplayItem[]> = this.store.select(selectDataCatalogueItems);
  private readonly dataCatalogueLoadingState$: Observable<LoadingState> = this.store.select(selectLoadingState);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly configService: ConfigService,
  ) {
    this.store.dispatch(DataCatalogueActions.loadCatalogue());
  }

  public ngAfterViewInit() {
    // In order for the paginator to correctly work, we need to wait for its rendered state in the DOM.
    this.subscriptions.add(
      this.dataCatalogueLoadingState$
        .pipe(
          filter((loadingState) => loadingState === 'loaded'),
          tap(() => {
            // This is necessary to force it to be rendered in the next tick, otherwise, changedetection won't pick it up
            setTimeout(() => (this.dataCatalogueItems.paginator = this.paginator), 0);
          }),
        )
        .subscribe(),
    );
  }

  public ngOnInit() {
    this.store.dispatch(SearchActions.clearSearchTerm());
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig.searchOptions}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clearSearchTerm());
  }

  public openFilterWindow() {
    this.dialogService.open<DataCatalogueFilterDialogComponent>(DataCatalogueFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  public toggleFilter({key, value}: ActiveDataCatalogueFilter) {
    this.store.dispatch(DataCatalogueActions.toggleFilter({key, value}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.dataCatalogueLoadingState$.pipe(tap((loadingState) => (this.loadingState = loadingState))).subscribe());
    this.subscriptions.add(this.dataCatalogueItems$.pipe(tap((items) => (this.dataCatalogueItems.data = items))).subscribe());
    this.subscriptions.add(this.activeFilters$.pipe(tap((activeFilters) => (this.activeFilters = activeFilters))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
