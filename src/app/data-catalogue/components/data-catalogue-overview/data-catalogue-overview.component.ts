import {Component, Injectable, effect, inject, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {selectLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
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
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {OverviewSearchResultDisplayItem} from '../../../shared/interfaces/overview-search-resuilt-display.interface';
import {PageSectionComponent} from '../../../shared/components/page-section/page-section.component';
import {HeroHeaderComponent} from '../../../shared/components/hero-header/hero-header.component';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MatChipRow, MatChipRemove} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {CdkTable, CdkColumnDef, CdkCellDef, CdkCell, CdkRowDef, CdkRow} from '@angular/cdk/table';
import {OverviewSearchResultItemComponent} from '../../../shared/components/data-catalogue-overview-item/overview-search-result-item.component';
import {Subject} from 'rxjs';

const GEO_DATA_CATALOGUE_SUMMARY =
  'Im Geodatenkatalog finden Sie detaillierte Informationen zu allen verfügbaren Geodaten des Kantons Zürich: Woher sie stammen, wie aktuell und genau sie sind, wie Sie sie beziehen können und welche Nutzungsregeln gelten.';

@Injectable()
class DataCataloguePaginatorIntl implements MatPaginatorIntl {
  // This only exists because the interface requests it. No real need from userland code.
  public readonly changes: Subject<void> = new Subject();

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
  imports: [
    PageSectionComponent,
    HeroHeaderComponent,
    SearchInputComponent,
    LoadingAndProcessBarComponent,
    MatChipRow,
    MatChipRemove,
    MatIcon,
    CdkTable,
    CdkColumnDef,
    CdkCellDef,
    CdkCell,
    OverviewSearchResultItemComponent,
    CdkRowDef,
    CdkRow,
    MatPaginator,
  ],
})
export class DataCatalogueOverviewComponent {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);
  private readonly configService = inject(ConfigService);

  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  public readonly activeFilters = this.store.selectSignal(selectActiveFilterValues);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly dataCatalogueLoadingState = this.store.selectSignal(selectLoadingState);
  public readonly dataCatalogueItemsFromStore = this.store.selectSignal(selectDataCatalogueItems);
  public dataCatalogueItems: MatTableDataSource<OverviewSearchResultDisplayItem> = new MatTableDataSource<OverviewSearchResultDisplayItem>(
    [],
  );
  public heroText = GEO_DATA_CATALOGUE_SUMMARY;
  private readonly searchConfig = this.configService.searchConfig.dataCatalogPage;
  private readonly paginator = viewChild.required<MatPaginator>(MatPaginator);

  constructor() {
    this.store.dispatch(DataCatalogueActions.loadCatalogue());
    this.clearSearchTerm();

    effect(() => {
      if (this.dataCatalogueLoadingState() === 'loaded') {
        queueMicrotask(() => {
          this.dataCatalogueItems.paginator = this.paginator();
          this.dataCatalogueItems._updateChangeSubscription();
        });
      }
    });

    effect(() => {
      this.dataCatalogueItems.data = this.dataCatalogueItemsFromStore();
      this.dataCatalogueItems._updateChangeSubscription();
    });
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
}
