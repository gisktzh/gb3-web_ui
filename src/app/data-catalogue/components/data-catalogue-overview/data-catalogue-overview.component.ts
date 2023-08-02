import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {DataCatalogueState} from '../../../state/data-catalogue/states/data-catalogue.state';
import {selectDataCatalogueState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {LoadingState} from '../../../shared/types/loading-state';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'data-catalogue-overview',
  templateUrl: './data-catalogue-overview.component.html',
  styleUrls: ['./data-catalogue-overview.component.scss'],
})
export class DataCatalogueOverviewComponent implements OnInit, OnDestroy, AfterViewInit {
  public loadingState: LoadingState = 'undefined';
  public dataCatalogueItems: MatTableDataSource<OverviewMetadataItem> = new MatTableDataSource<OverviewMetadataItem>([]);
  private readonly dataCatalogue$: Observable<DataCatalogueState> = this.store.select(selectDataCatalogueState);
  private readonly subscriptions: Subscription = new Subscription();
  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  constructor(private readonly store: Store) {
    this.store.dispatch(DataCatalogueActions.loadCatalogue());
  }

  ngAfterViewInit() {
    this.dataCatalogueItems.paginator = this.paginator;
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
