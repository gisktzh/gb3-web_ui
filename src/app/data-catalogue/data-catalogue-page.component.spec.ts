import {Component, ChangeDetectionStrategy} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {provideStore, Store} from '@ngrx/store';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {SearchActions} from '../state/app/actions/search.actions';
import {reducer as searchReducer, selectTerm} from '../state/app/reducers/search.reducer';
import {DataCatalogueActions} from '../state/data-catalogue/actions/data-catalogue.actions';
import {reducer as dataCatalogueReducer, selectItems, selectFilters} from '../state/data-catalogue/reducers/data-catalogue.reducer';
import {DatasetOverviewMetadataItem} from '../shared/models/overview-search-result.model';
import {DataCataloguePage} from '../shared/enums/data-catalogue-page.enum';
import {searchConfig} from '../shared/configs/search.config';

@Component({selector: 'test-catalogue-child', template: '', changeDetection: ChangeDetectionStrategy.Eager})
class CatalogueChildComponent {}

describe('DataCataloguePageComponent navigation', () => {
  let store: Store;
  let harness: RouterTestingHarness;
  const items = [new DatasetOverviewMetadataItem('dataset', 'Hanglagen', '', 'BLW', ['GPKG'], true)];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideStore({search: searchReducer, dataCatalogue: dataCatalogueReducer}),
        provideRouter([
          {
            path: 'data',
            component: DataCataloguePageComponent,
            children: [
              {path: '', component: CatalogueChildComponent},
              ...Object.values(DataCataloguePage).map((type) => ({path: `${type}/:id`, component: CatalogueChildComponent})),
            ],
          },
          {path: 'other', component: CatalogueChildComponent},
          {path: 'blocked', component: CatalogueChildComponent, canActivate: [() => false]},
        ]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(DataCatalogueActions.setCatalogue({items}));
    store.dispatch(
      DataCatalogueActions.setFilters({
        dataCatalogueFilters: [{key: 'type', label: 'Kategorie', filterValues: [{value: 'Geodatensatz', isActive: false}]}],
      }),
    );
    harness = await RouterTestingHarness.create();
  });

  function search() {
    store.dispatch(SearchActions.searchForTerm({term: 'hanglagen', options: searchConfig.dataCatalogPage.searchOptions}));
    store.dispatch(DataCatalogueActions.toggleFilter({key: 'type', value: 'Geodatensatz'}));
  }

  function expectSearch(term: string, filterActive: boolean) {
    expect(store.selectSignal(selectTerm)()).toBe(term);
    expect(store.selectSignal(selectFilters)()[0].filterValues[0].isActive).toBe(filterActive);
    expect(store.selectSignal(selectItems)()).toEqual(items);
  }

  it('starts a catalogue visit without search criteria inherited from another page', async () => {
    search();
    await harness.navigateByUrl('/data');

    expectSearch('', false);
  });

  for (const type of Object.values(DataCataloguePage)) {
    it(`preserves search criteria between the overview and a ${type} detail`, async () => {
      await harness.navigateByUrl('/data');
      search();
      await harness.navigateByUrl(`/data/${type}/item`);
      expectSearch('hanglagen', true);
      await harness.navigateByUrl('/data');
      expectSearch('hanglagen', true);
    });
  }

  it('clears search criteria when leaving a detail and keeps the cached catalogue', async () => {
    await harness.navigateByUrl('/data');
    search();
    await harness.navigateByUrl('/data/datasets/item');
    await harness.navigateByUrl('/other');
    expectSearch('', false);
    await harness.navigateByUrl('/data');
    expectSearch('', false);
  });

  it('keeps search criteria if navigation out of the catalogue is cancelled', async () => {
    await harness.navigateByUrl('/data');
    search();
    await TestBed.inject(Router).navigateByUrl('/blocked');

    expectSearch('hanglagen', true);
  });
});
