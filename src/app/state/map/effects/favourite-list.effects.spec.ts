import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {catchError} from 'rxjs/operators';
import {FavouriteListEffects} from './favourite-list.effects';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouriteCouldNotBeLoaded, FavouriteIsInvalid, FavouritesCouldNotBeLoaded} from '../../../shared/errors/favourite.errors';
import {FavouritesService} from '../../../map/services/favourites.service';

describe('FavouriteListEffects', () => {
  let actions$: Observable<Action>;
  let effects: FavouriteListEffects;
  let favouriteServiceMock: jasmine.SpyObj<FavouritesService>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    favouriteServiceMock = jasmine.createSpyObj<FavouritesService>(['loadFavourites']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FavouriteListEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
      ],
    });
    effects = TestBed.inject(FavouriteListEffects);
  });

  describe('requestFavouriteList', () => {
    it('dispatches FavouriteListActions.setFavourites after loading the favourites', (done: DoneFn) => {
      favouriteServiceMock.loadFavourites.and.returnValue(of([]));

      actions$ = of(FavouriteListActions.loadFavourites());
      effects.requestFavouriteList$.subscribe((action) => {
        expect(favouriteServiceMock.loadFavourites).toHaveBeenCalledTimes(1);
        expect(action).toEqual(FavouriteListActions.setFavourites({favourites: []}));
        done();
      });
    });

    it('dispatches FavouriteListActions.setError if something went wrong', (done: DoneFn) => {
      const expectedError = new FavouritesCouldNotBeLoaded('Favoriten konnten nicht geladen werden');
      const favouriteServiceMockSpy = favouriteServiceMock.loadFavourites.and.returnValue(throwError(() => expectedError));

      actions$ = of(FavouriteListActions.loadFavourites());
      effects.requestFavouriteList$.subscribe((action) => {
        expect(favouriteServiceMockSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(FavouriteListActions.setError({error: expectedError}));
        done();
      });
    });
  });

  describe('setError$', () => {
    it('throws a FavouritesCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new Error('oh no! butterfingers');

      actions$ = of(FavouriteListActions.setError({error: expectedOriginalError}));
      effects.setError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new FavouritesCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('displayError$', () => {
    it('throws a FavouriteCouldNotBeLoaded error', (done: DoneFn) => {
      const expectedOriginalError = new FavouriteIsInvalid('oh no! butterfingers');

      actions$ = of(FavouriteListActions.setInvalid({id: '123', error: expectedOriginalError}));
      effects.displayError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new FavouriteCouldNotBeLoaded(expectedOriginalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
});
