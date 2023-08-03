import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';
import {MetadataOverviewCouldNotBeLoaded} from '../../../shared/errors/data-catalogue.errors';

@Injectable()
export class DataCatalogueEffects {
  public requestDataCatalogueItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.loadCatalogue),
      concatLatestFrom(() => [this.store.select(selectLoadingState)]),
      filter(([_, loadingState]) => loadingState !== 'loaded'),
      switchMap(() =>
        this.gb3MetadataService.loadFullList().pipe(
          map((items) => {
            return DataCatalogueActions.setCatalogue({items});
          }),
          catchError((error: unknown) => of(DataCatalogueActions.setError({error}))),
        ),
      ),
    );
  });

  public setError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataCatalogueActions.setError),
        tap(({error}) => {
          throw new MetadataOverviewCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly gb3MetadataService: Gb3MetadataService,
    private readonly store: Store,
  ) {}
}
