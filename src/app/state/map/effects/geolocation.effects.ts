import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {GeolocationService} from '../../../map/services/geolocation.service';
import {GeolocationActions} from '../actions/geolocation.actions';

@Injectable()
export class GeolocationEffects {
  public dispatchClientLocationRequest$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(GeolocationActions.startLocationRequest),
        tap(() => {
          this.geoLocationService.getPosition();
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, private readonly geoLocationService: GeolocationService) {}
}
