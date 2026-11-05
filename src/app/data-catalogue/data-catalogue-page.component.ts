import {Component, ChangeDetectionStrategy, inject, OnDestroy} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Store} from '@ngrx/store';
import {SearchActions} from '../state/app/actions/search.actions';

@Component({
  selector: 'data-catalogue-page',
  templateUrl: './data-catalogue-page.component.html',
  styleUrls: ['./data-catalogue-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet],
})
export class DataCataloguePageComponent implements OnDestroy {
  private readonly store = inject(Store);

  constructor() {
    this.resetSearch();
  }

  public ngOnDestroy() {
    this.resetSearch();
  }

  private resetSearch() {
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }
}
