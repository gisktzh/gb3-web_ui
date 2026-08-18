import {TestBed} from '@angular/core/testing';
import {Action} from '@ngrx/store';
import {provideMockActions} from '@ngrx/effects/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Observable, of, throwError} from 'rxjs';
import {MockedObject} from 'vitest';
import {OerebExtractEffects} from './oereb-extract.effects';
import {OerebExtractActions} from '../actions/oereb-extract.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {selectHasOerebMapActive} from '../selectors/has-oereb-map-active.selector';
import {Gb3OerebExtractService} from 'src/app/shared/services/apis/gb3/gb3-oereb-extract.service';
import {OerebExtractCouldNotBeLoaded} from 'src/app/shared/errors/map.errors';
import {OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';

describe('OerebExtractEffects', () => {
  let actions$: Observable<Action>;
  let effects: OerebExtractEffects;
  let oerebExtractService: MockedObject<Gb3OerebExtractService>;
  let store: MockStore;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    const spyOerebExtractService: Partial<Gb3OerebExtractService> = {
      loadOerebExtract: vi.fn().mockName('Gb3OerebExtractService.loadOerebExtract'),
    };

    TestBed.configureTestingModule({
      providers: [
        OerebExtractEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: Gb3OerebExtractService,
          useValue: spyOerebExtractService,
        },
      ],
    });

    effects = TestBed.inject(OerebExtractEffects);
    store = TestBed.inject(MockStore);
    oerebExtractService = TestBed.inject(Gb3OerebExtractService) as MockedObject<Gb3OerebExtractService>;
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('clearData$', () => {
    it('dispatches OerebExtractActions.clearContent()', () => {
      const expectedAction = OerebExtractActions.clearContent();

      actions$ = of(MapConfigActions.clearFeatureInfoContent());

      effects.clearData$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('interceptMapClick$', () => {
    it('dispatches OerebExtractActions.sendRequest() when the OEREB map is active', () => {
      store.overrideSelector(selectHasOerebMapActive, true);

      const expectedAction = OerebExtractActions.sendRequest({
        x: 123,
        y: 456,
      });

      actions$ = of(
        MapConfigActions.handleMapClick({
          x: 123,
          y: 456,
          scale: 0,
        }),
      );

      effects.interceptMapClick$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches OerebExtractActions.updateContent() with null when the OEREB map is not active', () => {
      store.overrideSelector(selectHasOerebMapActive, false);

      const expectedAction = OerebExtractActions.updateContent({
        oerebExtract: null,
      });

      actions$ = of(
        MapConfigActions.handleMapClick({
          x: 123,
          y: 456,
          scale: 0,
        }),
      );

      effects.interceptMapClick$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('requestOerebExtract$', () => {
    it('dispatches OerebExtractActions.updateContent() when the OEREB extract was loaded successfully', () => {
      const oerebExtract: OerebExtractResponse = {
        municipalityName: 'Stadthausen',
        municipalityCode: 1337,
        parcelNumber: '1234',
        egrid: '',
        kbo: {
          title: 'yes',
        },
        surveyor: {
          title: 'who wants to know this?',
        },
        concernedThemes: [],
        notConcernedThemes: [],
        notAvailableThemes: [],
      };

      oerebExtractService.loadOerebExtract.mockReturnValue(of(oerebExtract));

      const expectedAction = OerebExtractActions.updateContent({
        oerebExtract,
      });

      actions$ = of(
        OerebExtractActions.sendRequest({
          x: 123,
          y: 456,
        }),
      );

      effects.requestOerebExtract$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(oerebExtractService.loadOerebExtract).toHaveBeenCalledWith(123, 456);
      });
    });

    it('dispatches OerebExtractActions.setError() when loading the OEREB extract fails', () => {
      const error = new Error('Something went wrong');

      oerebExtractService.loadOerebExtract.mockReturnValue(throwError(() => error));

      const expectedAction = OerebExtractActions.setError({
        error,
      });

      actions$ = of(
        OerebExtractActions.sendRequest({
          x: 123,
          y: 456,
        }),
      );

      effects.requestOerebExtract$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        expect(oerebExtractService.loadOerebExtract).toHaveBeenCalledWith(123, 456);
      });
    });
  });

  describe('setError$', () => {
    it('throws OerebExtractCouldNotBeLoaded', () => {
      const error = new Error('Something went wrong');

      actions$ = of(OerebExtractActions.setError({error}));

      effects.setError$.subscribe({
        error: (actualError: unknown) => {
          expect(actualError).toBeInstanceOf(OerebExtractCouldNotBeLoaded);
        },
      });
    });
  });
});
