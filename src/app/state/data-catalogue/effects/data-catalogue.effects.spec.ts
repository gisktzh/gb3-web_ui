import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {DataCatalogueEffects} from './data-catalogue.effects';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {MetadataOverviewCouldNotBeLoaded} from '../../../shared/errors/data-catalogue.errors';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {MapOverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';

describe('DataCatalogueEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataCatalogueEffects;
  let gb3MetadataService: Gb3MetadataService;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataCatalogueEffects, provideMockActions(() => actions$), provideMockStore(), Gb3MetadataService],
    });
    effects = TestBed.inject(DataCatalogueEffects);
    gb3MetadataService = TestBed.inject(Gb3MetadataService);
    store = TestBed.inject(MockStore);
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
    it('dispatches DataCatalogueActions.setCatalogue() with the service response on success YYYY', (done: DoneFn) => {
      const expected = [new MapOverviewMetadataItem(1377, 'Test', 'Testbeschreibung')];
      spyOn(gb3MetadataService, 'loadFullList').and.callFake(() => {
        return of(expected);
      });
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
});
