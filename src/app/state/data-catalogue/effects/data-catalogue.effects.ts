import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';
import {MetadataOverviewCouldNotBeLoaded} from '../../../shared/errors/data-catalogue.errors';
import {DataCatalogueFilter, DataCatalogueFilterProperty} from '../../../shared/interfaces/data-catalogue-filter.interface';

const filters: DataCatalogueFilterProperty[] = [
  // todo: add ogd
  {key: 'type', label: 'Kategorie'},
  {key: 'responsibleDepartment', label: 'Datenbereitsteller'},
  {key: 'outputFormat', label: 'Dateiformate'},
];

@Injectable()
export class DataCatalogueEffects {
  public requestDataCatalogueItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.loadCatalogue),
      concatLatestFrom(() => [this.store.select(selectLoadingState)]),
      filter(([_, loadingState]) => loadingState !== 'loaded'), // only dispatch once per app load, else serve from cache
      switchMap(() => this.gb3MetadataService.loadFullList()),
      map((items) => DataCatalogueActions.setCatalogue({items})),
      catchError((error: unknown) => of(DataCatalogueActions.setError({error}))),
    );
  });

  public initializeDataCatalogueFilters = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.setCatalogue),
      map(({items}) => {
        const uniqueValues: Map<Pick<DataCatalogueFilter, 'key' | 'label'>, Set<string>> = new Map();

        items.forEach((m) => {
          filters.forEach((filter) => {
            if (filter.key in m) {
              const value: string = (m as any)[filter.key]; //this typecast is safe here because we _know_ the property exists here
              if (!uniqueValues.has(filter)) {
                uniqueValues.set(filter, new Set());
              }
              uniqueValues.get(filter)?.add(value);
            }
          });
        });

        const dataCatalogueFilters: DataCatalogueFilter[] = [];
        uniqueValues.forEach((value, key) =>
          dataCatalogueFilters.push({
            key: key.key,
            label: key.label,
            filterValues: Array.from(value).map((value) => ({value, isActive: false})),
          }),
        );

        return DataCatalogueActions.setFilters({dataCatalogueFilters});
      }),
    );
  });

  public throwError$ = createEffect(
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
