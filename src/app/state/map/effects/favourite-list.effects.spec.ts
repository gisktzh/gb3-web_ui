import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs';
import {FavouriteListEffects} from './favourite-list.effects';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouriteCouldNotBeLoaded, FavouriteIsInvalid, FavouritesCouldNotBeLoaded} from '../../../shared/errors/favourite.errors';
import {FavouritesService} from '../../../map/services/favourites.service';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {TIME_SERVICE} from 'src/app/app.tokens';
import {timeServiceFactory} from 'src/app/shared/factories/time-service.factory';

describe('FavouriteListEffects', () => {
  let actions$: Observable<Action>;
  let effects: FavouriteListEffects;
  const favouriteServiceMock = {
    loadFavourites: vi.fn(),
  };

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        FavouriteListEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: TIME_SERVICE,
          useFactory: timeServiceFactory,
        },
      ],
    });
    effects = TestBed.inject(FavouriteListEffects);
  });

  describe('requestFavouriteList', () => {
    it('dispatches FavouriteListActions.setFavourites after loading the favourites', () => {
      favouriteServiceMock.loadFavourites.mockReturnValue(of([]));

      actions$ = of(FavouriteListActions.loadFavourites());
      effects.requestFavouriteList$.subscribe((action) => {
        expect(favouriteServiceMock.loadFavourites).toHaveBeenCalledTimes(1);
        expect(action).toEqual(FavouriteListActions.setFavourites({favourites: []}));
      });
    });

    it('dispatches FavouriteListActions.setError if something went wrong', () => {
      const expectedError = new FavouritesCouldNotBeLoaded('Favoriten konnten nicht geladen werden');
      const favouriteServiceMockSpy = favouriteServiceMock.loadFavourites.mockReturnValue(throwError(() => expectedError));

      actions$ = of(FavouriteListActions.loadFavourites());
      effects.requestFavouriteList$.subscribe((action) => {
        expect(favouriteServiceMockSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(FavouriteListActions.setError({error: expectedError}));
      });
    });
  });

  describe('setError$', () => {
    it('throws a FavouritesCouldNotBeLoaded error', () => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(FavouriteListActions.setError({error: expectedOriginalError}));
      effects.setError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new FavouritesCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('displayError$', () => {
    it('throws a FavouriteCouldNotBeLoaded error', () => {
      const expectedOriginalError = new FavouriteIsInvalid('oh no! butterfingers');

      actions$ = of(FavouriteListActions.setInvalid({id: '123', error: expectedOriginalError}));
      effects.displayError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new FavouriteCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
