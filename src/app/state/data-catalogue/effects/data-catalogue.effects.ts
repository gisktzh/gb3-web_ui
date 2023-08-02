import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';

@Injectable()
export class DataCatalogueEffects {
  public requestDataCatalogueItems = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.loadCatalogue),
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
  ) {}
}
