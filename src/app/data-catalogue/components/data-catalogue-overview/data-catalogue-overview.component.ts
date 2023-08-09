import {AfterViewInit, Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter, Observable, Subject, Subscription, take, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {selectFilters, selectLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {selectDataCatalogueItems} from '../../../state/data-catalogue/selectors/data-catalogue-items.selector';

import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';

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
      return this.getRangeLabelText(1, 1, 0);
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.getRangeLabelText(page + 1, amountPages, length);
  }

  private getRangeLabelText(currentPage: number, amountPages: number, length: number): string {
    return `Seite ${currentPage} von ${amountPages} | ${length} Elemente`;
  }
}

@Component({
  selector: 'data-catalogue-overview',
  templateUrl: './data-catalogue-overview.component.html',
  styleUrls: ['./data-catalogue-overview.component.scss'],
  providers: [{provide: MatPaginatorIntl, useClass: DataCataloguePaginatorIntl}],
})
export class DataCatalogueOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  public loadingState: LoadingState = 'undefined';
  // We use the MatTableDataSource here because it already has pagination handling embedded - depending on our needs, we might to
  // implement a custom DataSource and handle pagination manually.
  public dataCatalogueItems: MatTableDataSource<OverviewMetadataItem> = new MatTableDataSource<OverviewMetadataItem>([]);
  public dataCatalogueFilters: DataCatalogueFilter[] = [];
  private readonly dataCatalogueFilters$: Observable<DataCatalogueFilter[]> = this.store.select(selectFilters);
  private readonly dataCatalogueItems$: Observable<OverviewMetadataItem[]> = this.store.select(selectDataCatalogueItems);
  private readonly dataCatalogueLoadingState$: Observable<LoadingState> = this.store.select(selectLoadingState);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  constructor(private readonly store: Store) {
    this.store.dispatch(DataCatalogueActions.loadCatalogue());
  }

  public ngAfterViewInit() {
    // In order for the paginator to correctly work, we need to wait for its rendered state in the DOM.
    this.subscriptions.add(
      this.dataCatalogueLoadingState$
        .pipe(
          filter((loadingState) => loadingState === 'loaded'),
          take(1),
          tap(() => {
            // This is necessary to force it to be rendered in the next tick, otherwise, changedetection won't pick it up
            setTimeout(() => (this.dataCatalogueItems.paginator = this.paginator), 0);
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.dataCatalogueFilters$
        .pipe(
          tap((dataCatalogueFilters) =>
            // This is necessary because the filters are loaded so fast that they are directly updated, triggering NG100
            setTimeout(() => (this.dataCatalogueFilters = dataCatalogueFilters), 0),
          ),
        )
        .subscribe(),
    );
  }

  public ngOnInit() {
    this.subscriptions.add(this.dataCatalogueLoadingState$.pipe(tap((loadingState) => (this.loadingState = loadingState))).subscribe());
    this.subscriptions.add(
      this.dataCatalogueItems$
        .pipe(
          tap((items) => {
            this.dataCatalogueItems.data = items;
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleFilter(
    key: 'outputFormat' | 'relativeUrl' | 'guid' | 'name' | 'description' | 'type' | 'responsibleDepartment',
    filterValue: string,
  ) {
    console.log(`Filter for ${key} with value ${filterValue}`);
    this.store.dispatch(DataCatalogueActions.toggleFilter({key, value: filterValue}));
  }
}
