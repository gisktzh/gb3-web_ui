import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {filter, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectProducts} from '../reducers/data-download-product.reducer';
import {GeoshopApiService} from '../../../shared/services/apis/geoshop/services/geoshop-api.service';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';

@Injectable()
export class DataDownloadProductEffects {
  public loadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadProductActions.loadProducts),
      concatLatestFrom(() => [this.store.select(selectProducts)]),
      filter(([_, products]) => products === undefined),
      switchMap(() =>
        this.geoshopApiService.loadProducts().pipe(
          map((products) => {
            return DataDownloadProductActions.setProducts({products});
          }),
          catchError((error: unknown) => of(DataDownloadProductActions.setProductsError({error}))),
        ),
      ),
    );
  });

  public throwProductsError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadProductActions.setProductsError),
        tap(({error}) => {
          throw new ProductsCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly geoshopApiService: GeoshopApiService,
  ) {}
}
