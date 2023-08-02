import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, filter, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';

@Injectable()
export class DataCatalogueEffects {
  public requestDataCatalogueItems = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.loadCatalogue),
      concatLatestFrom(() => [this.store.select(selectLoadingState)]),
      filter(([_, loadingState]) => loadingState !== 'loaded'),
      switchMap(() =>
        this.gb3MetadataService.loadFullList().pipe(
          map((items) => {
            return DataCatalogueActions.setCatalogue({items});
          }),
          catchError(() => EMPTY), // todo error handling
        ),
      ),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly gb3MetadataService: Gb3MetadataService,
    private readonly store: Store,
  ) {}
}
