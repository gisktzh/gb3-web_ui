import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {catchError, map} from 'rxjs';
import {filter, of, switchMap, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {selectCanton, selectFederation, selectMunicipalities} from '../reducers/data-download-region.reducer';
import {Gb3GeoshopBoundingBoxService} from '../../../shared/services/apis/gb3/gb3-geoshop-bounding-box.service';
import {Gb3GeoshopMunicipalitiesService} from '../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {
  CantonCouldNotBeLoaded,
  FederationCouldNotBeLoaded,
  MunicipalitiesCouldNotBeLoaded,
} from '../../../shared/errors/data-download.errors';

@Injectable()
export class DataDownloadRegionEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly geoshopBoundingBoxService = inject(Gb3GeoshopBoundingBoxService);
  private readonly geoshopMunicipalitiesService = inject(Gb3GeoshopMunicipalitiesService);

  public loadFederation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadRegionActions.loadFederation),
      concatLatestFrom(() => [this.store.select(selectFederation)]),
      filter(([_, federation]) => federation === undefined),
      switchMap(() =>
        this.geoshopBoundingBoxService.load('CH').pipe(
          map((federation) => {
            return DataDownloadRegionActions.setFederation({federation});
          }),
          catchError((error: unknown) => of(DataDownloadRegionActions.setFederationError({error}))),
        ),
      ),
    );
  });

  public throwFederationError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadRegionActions.setFederationError),
        tap(({error}) => {
          throw new FederationCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public loadCanton$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadRegionActions.loadCanton),
      concatLatestFrom(() => [this.store.select(selectCanton)]),
      filter(([_, canton]) => canton === undefined),
      switchMap(() =>
        this.geoshopBoundingBoxService.load('ZH').pipe(
          map((canton) => {
            return DataDownloadRegionActions.setCanton({canton});
          }),
          catchError((error: unknown) => of(DataDownloadRegionActions.setCantonError({error}))),
        ),
      ),
    );
  });

  public throwCantonError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadRegionActions.setCantonError),
        tap(({error}) => {
          throw new CantonCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public loadMunicipalities$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadRegionActions.loadMunicipalities),
      concatLatestFrom(() => [this.store.select(selectMunicipalities)]),
      filter(([_, municipalities]) => municipalities.length === 0),
      switchMap(() =>
        this.geoshopMunicipalitiesService.loadMunicipalities().pipe(
          map((municipalities) => {
            return DataDownloadRegionActions.setMunicipalities({municipalities});
          }),
          catchError((error: unknown) => of(DataDownloadRegionActions.setMunicipalitiesError({error}))),
        ),
      ),
    );
  });

  public throwMunicipalitiesError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadRegionActions.setMunicipalitiesError),
        tap(({error}) => {
          throw new MunicipalitiesCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );
}
