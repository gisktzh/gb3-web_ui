import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {Store} from '@ngrx/store';
import {selectLoadingState} from '../reducers/data-catalogue.reducer';
import {MetadataOverviewCouldNotBeLoaded} from '../../../shared/errors/data-catalogue.errors';
import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {ConfigService} from '../../../shared/services/config.service';

@Injectable()
export class DataCatalogueEffects {
  public requestDataCatalogueItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.loadCatalogue),
      concatLatestFrom(() => [this.store.select(selectLoadingState)]),
      filter(([_, loadingState]) => loadingState !== 'loaded'), // only dispatch once per app load, else serve from cache
      switchMap(() =>
        this.gb3MetadataService.loadFullList().pipe(
          map((items) => DataCatalogueActions.setCatalogue({items})),
          catchError((error: unknown) => of(DataCatalogueActions.setError({error}))),
        ),
      ),
    );
  });

  public initializeDataCatalogueFilters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataCatalogueActions.setCatalogue),
      map(({items}) => {
        const uniqueValues: Map<Pick<DataCatalogueFilter, 'key' | 'label'>, Set<string>> = new Map();

        // We cast to any because not all items have all the properties from DataCatalogueFilterConfiguration. To remove the cast, we would need to refactor
        (items as any[]).forEach((item) => {
          this.configService.filterConfigs.dataCatalogue.forEach((dataCatalogueFilter) => {
            if (dataCatalogueFilter.key in item) {
              if (!uniqueValues.has(dataCatalogueFilter)) {
                uniqueValues.set(dataCatalogueFilter, new Set());
              }
              let values: string[];
              if (item[dataCatalogueFilter.key] instanceof Array) {
                values = item[dataCatalogueFilter.key];
              } else {
                values = [item[dataCatalogueFilter.key]]; // We treat all values as Arrays and unpack them later to account for the arrays provided in the output format
              }
              values.forEach((value) => {
                uniqueValues.get(dataCatalogueFilter)?.add(value);
              });
            }
          });
        });

        const dataCatalogueFilters: DataCatalogueFilter[] = [];
        uniqueValues.forEach((uniqueValue, key) =>
          dataCatalogueFilters.push({
            key: key.key,
            label: key.label,
            filterValues: Array.from(uniqueValue).map((uniqueFilterValue) => ({value: uniqueFilterValue, isActive: false})),
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
    private readonly configService: ConfigService,
  ) {}
}
