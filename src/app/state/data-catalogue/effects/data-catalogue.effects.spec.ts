import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {DataCatalogueEffects} from './data-catalogue.effects';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {MetadataOverviewCouldNotBeLoaded} from '../../../shared/errors/data-catalogue.errors';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {DatasetOverviewMetadataItem, MapOverviewMetadataItem} from '../../../shared/models/overview-search-result.model';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';
import {ConfigService} from '../../../shared/services/config.service';
import {DataCatalogueFilter, DataCatalogueFilterConfiguration} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('DataCatalogueEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataCatalogueEffects;
  let gb3MetadataService: Gb3MetadataService;
  let configService: ConfigService;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DataCatalogueEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        Gb3MetadataService,
        ConfigService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(DataCatalogueEffects);
    gb3MetadataService = TestBed.inject(Gb3MetadataService);
    store = TestBed.inject(MockStore);
    configService = TestBed.inject(ConfigService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('setError$', () => {
    it('raises MetadataOverviewCouldNotBeLoaded exception with the passed error', (done: DoneFn) => {
      const mockError = new Error('ErrorWrap - delicious and only 5$');
      actions$ = of(DataCatalogueActions.setError({error: mockError}));

      effects.throwError$.subscribe({
        error: (err: unknown) => {
          expect(err).toBeInstanceOf(MetadataOverviewCouldNotBeLoaded);
          expect((err as MetadataOverviewCouldNotBeLoaded).originalError).toEqual(mockError);
          done();
        },
        complete: () => {
          fail('Did not raise an exception.');
        },
      });
    });
  });

  describe('requestDataCatalogueItems$', () => {
    it('dispatches DataCatalogueActions.setCatalogue() with the service response on success', (done: DoneFn) => {
      const expected = [new MapOverviewMetadataItem('1337', 'Test', 'Testbeschreibung', 'Testamt')];
      spyOn(gb3MetadataService, 'loadFullList').and.returnValue(of(expected));
      actions$ = of(DataCatalogueActions.loadCatalogue());

      effects.requestDataCatalogueItems$.subscribe((action) => {
        expect(action).toEqual(DataCatalogueActions.setCatalogue({items: expected}));
        done();
      });
    });

    it('dispatches DataCatalogueActions.setError() if the data cannot be loaded', (done: DoneFn) => {
      const mockError = new Error('Failed loading data');
      spyOn(gb3MetadataService, 'loadFullList').and.returnValue(throwError(() => mockError));
      actions$ = of(DataCatalogueActions.loadCatalogue());

      effects.requestDataCatalogueItems$.subscribe((action) => {
        expect(action).toEqual(DataCatalogueActions.setError({error: mockError}));
        done();
      });
    });

    it('does not dispatch a request if loadingState is already loaded', (done: DoneFn) => {
      store.overrideSelector(selectLoadingState, 'loaded');
      spyOn(gb3MetadataService, 'loadFullList');
      actions$ = of(DataCatalogueActions.loadCatalogue());

      effects.requestDataCatalogueItems$.subscribe({
        complete: () => {
          expect(gb3MetadataService.loadFullList).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  describe('initializeDataCatalogueFilters$', () => {
    it('extracts the configured filter values', (done: DoneFn) => {
      const mockItems = [new DatasetOverviewMetadataItem('1337', 'Test', 'Testbeschreibung', 'Testamt', ['csv', 'Shapefile'], true)];
      const mockConfig: DataCatalogueFilterConfiguration[] = [
        {key: 'description', label: 'Description'},
        {key: 'responsibleDepartment', label: 'Verantwortlich'},
        {key: 'outputFormat', label: 'Dateiformate'},
      ];
      spyOnProperty(configService, 'filterConfigs', 'get').and.returnValue({
        dataCatalogue: mockConfig,
        dataDownload: [],
      });

      actions$ = of(DataCatalogueActions.setCatalogue({items: mockItems}));

      const expected: DataCatalogueFilter[] = [
        {key: mockConfig[0].key, label: mockConfig[0].label, filterValues: [{value: mockItems[0].description, isActive: false}]},
        {key: mockConfig[1].key, label: mockConfig[1].label, filterValues: [{value: mockItems[0].responsibleDepartment, isActive: false}]},
        {
          key: mockConfig[2].key,
          label: mockConfig[2].label,
          filterValues: [
            {value: mockItems[0].outputFormat[0], isActive: false},
            {value: mockItems[0].outputFormat[1], isActive: false},
          ],
        },
      ];

      effects.initializeDataCatalogueFilters$.subscribe((action) => {
        expect(action).toEqual(DataCatalogueActions.setFilters({dataCatalogueFilters: expected}));
        done();
      });
    });

    it('does not add a non-existing property if no values are present', (done: DoneFn) => {
      const mockItems = [new MapOverviewMetadataItem('1337', 'Test', 'Testbeschreibung', 'Testamt')];
      const mockConfig: DataCatalogueFilterConfiguration[] = [{key: 'outputFormat', label: 'Exists only on DatasetDetails :)'}];
      spyOnProperty(configService, 'filterConfigs', 'get').and.returnValue({
        dataCatalogue: mockConfig,
        dataDownload: [],
      });

      actions$ = of(DataCatalogueActions.setCatalogue({items: mockItems}));

      const expected: DataCatalogueFilter[] = [];

      effects.initializeDataCatalogueFilters$.subscribe((action) => {
        expect(action).toEqual(DataCatalogueActions.setFilters({dataCatalogueFilters: expected}));
        done();
      });
    });

    it('extracts unique values once', (done: DoneFn) => {
      const mockItems = [
        new MapOverviewMetadataItem('1337', 'Test A', 'Testbeschreibung', 'Testamt'),
        new MapOverviewMetadataItem('1337', 'Test B', 'Testbeschreibung', 'Testamt'),
        new MapOverviewMetadataItem('1337', 'Test B', 'Testbeschreibung', 'Testamt mit anderem Beschrieb'),
      ];
      const mockConfig: DataCatalogueFilterConfiguration[] = [
        {key: 'name', label: 'Name'},
        {key: 'responsibleDepartment', label: 'Amt'},
      ];
      spyOnProperty(configService, 'filterConfigs', 'get').and.returnValue({
        dataCatalogue: mockConfig,
        dataDownload: [],
      });

      actions$ = of(DataCatalogueActions.setCatalogue({items: mockItems}));

      const expected: DataCatalogueFilter[] = [
        {
          key: 'name',
          label: 'Name',
          filterValues: [
            {value: 'Test A', isActive: false},
            {value: 'Test B', isActive: false},
          ],
        },
        {
          key: 'responsibleDepartment',
          label: 'Amt',
          filterValues: [
            {value: 'Testamt', isActive: false},
            {value: 'Testamt mit anderem Beschrieb', isActive: false},
          ],
        },
      ];

      effects.initializeDataCatalogueFilters$.subscribe((action) => {
        expect(action).toEqual(DataCatalogueActions.setFilters({dataCatalogueFilters: expected}));
        done();
      });
    });
  });
});
