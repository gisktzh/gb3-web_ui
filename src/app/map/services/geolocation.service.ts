import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Store} from '@ngrx/store';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {GeolocationActions} from '../../state/map/actions/geolocation.actions';
import {NavigatorNotAvailable} from '../models/errors';

const GEOLOCATION_TIMEOUT_IN_MS = 5000;

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  private readonly navigator?: Navigator;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly store: Store,
  ) {
    if (this.document.defaultView) {
      this.navigator = this.document.defaultView.navigator;
    } else {
      throw new NavigatorNotAvailable();
    }
  }

  public getPosition() {
    if (!this.navigator) {
      this.store.dispatch(GeolocationActions.setFailure({error: new GeolocationPositionError()}));
    } else {
      this.navigator.geolocation.getCurrentPosition(
        (position) => {
          // Geolocation API always returns 4326 coordinates
          const location: PointWithSrs = {coordinates: [position.coords.longitude, position.coords.latitude], srs: 4326, type: 'Point'};
          this.store.dispatch(GeolocationActions.setGeolocation({location}));
        },
        (error) => {
          this.store.dispatch(GeolocationActions.setFailure({error}));
        },
        {
          timeout: GEOLOCATION_TIMEOUT_IN_MS,
        },
      );
    }
  }
}
