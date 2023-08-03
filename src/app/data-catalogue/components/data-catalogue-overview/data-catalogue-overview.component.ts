import {AfterViewInit, Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter, Observable, Subject, Subscription, take, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {DataCatalogueState} from '../../../state/data-catalogue/states/data-catalogue.state';
import {selectDataCatalogueState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {LoadingState} from '../../../shared/types/loading-state';
import {MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

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
      return 'Seite 1 von 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Seite ${page + 1} von ${amountPages} | ${length} Elemente`;
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
  private readonly dataCatalogue$: Observable<DataCatalogueState> = this.store.select(selectDataCatalogueState);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  constructor(private readonly store: Store) {
    this.store.dispatch(DataCatalogueActions.loadCatalogue());
  }

  ngAfterViewInit() {
    // In order for the paginator to correctly work, we need to wait for its rendered state in the DOM.
    this.subscriptions.add(
      this.dataCatalogue$
        .pipe(
          filter(({loadingState}) => loadingState === 'loaded'),
          take(1),
          tap(() => {
            // This is necessary to force it to be rendered in the next tick, otherwise, changedetection won't pick it up
            setTimeout(() => (this.dataCatalogueItems.paginator = this.paginator), 0);
          }),
        )
        .subscribe(),
    );
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.dataCatalogue$
        .pipe(
          tap(({items, loadingState}) => {
            this.dataCatalogueItems.data = items;
            this.loadingState = loadingState;
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
