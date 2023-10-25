import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ProductsCouldNotBeLoaded} from '../../../shared/errors/data-download.errors';
import {DataDownloadProductActions} from '../actions/data-download-product.actions';
import {Gb3GeoshopProductsService} from '../../../shared/services/apis/gb3/gb3-geoshop-products.service';
import {selectItems} from '../reducers/active-map-item.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';

@Injectable()
export class DataDownloadProductEffects {
  public loadProducts$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadProductActions.loadProducts),
      concatLatestFrom(() => this.store.select(selectItems)),
      map(([_, activeMapItems]) =>
        activeMapItems
          .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
          .map((activeMapItem) => activeMapItem.geometadataUuid)
          .filter((guid) => guid !== null),
      ),
      switchMap(([_, guids]) =>
        this.geoshopProductsService.loadGeoshopProductList(guids).pipe(
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
    private readonly geoshopProductsService: Gb3GeoshopProductsService,
  ) {}
}
