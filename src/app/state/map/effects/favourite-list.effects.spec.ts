import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {FavouritesService} from '../../../map/services/favourites.service';
import {RouterTestingModule} from '@angular/router/testing';
import {catchError} from 'rxjs/operators';
import {FavouriteListEffects} from './favourite-list.effects';
import {FavouriteListActions} from '../actions/favourite-list.actions';
import {FavouriteCouldNotBeLoaded, FavouriteIsInvalid} from '../../../shared/errors/favourite.errors';

describe('FavouriteListEffects', () => {
  let actions$: Observable<Action>;
  let effects: FavouriteListEffects;
  let favouriteServiceMock: jasmine.SpyObj<FavouritesService>;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    favouriteServiceMock = jasmine.createSpyObj<FavouritesService>(['getActiveMapItemsForFavourite', 'getDrawingsForFavourite']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        FavouriteListEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: FavouritesService, useValue: favouriteServiceMock},
      ],
    });
    effects = TestBed.inject(FavouriteListEffects);
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
