import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Store} from '@ngrx/store';
import {MAP_SERVICE} from '../../app.module';
import {MapService} from '../interfaces/map.service';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {GeolocationActions} from '../../state/map/actions/geolocation.actions';

const GEOLOCATION_TIMEOUT_IN_MS = 5000;
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private readonly navigator?: Navigator;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly store: Store
  ) {
    if (this.document.defaultView) {
      this.navigator = this.document.defaultView.navigator;
    } else {
      console.error('Navigator not available.'); // todo: error handling
    }
  }

  public getPosition() {
    if (!this.navigator) {
      // todo: at some point in the future, we need to check whether this works - so we need a browser that does not have the navigator API.
      this.store.dispatch(GeolocationActions.setFailure({error: new GeolocationPositionError()}));
    } else {
      this.navigator.geolocation.getCurrentPosition(
        (position) => {
          // Geolocation API always returns 4326 coordinates
          const location: PointWithSrs = {coordinates: [position.coords.longitude, position.coords.latitude], srs: 4326, type: 'Point'};
          this.store.dispatch(GeolocationActions.setSuccess({location}));
        },
        (error) => {
          this.store.dispatch(GeolocationActions.setFailure({error}));
        },
        {
          timeout: GEOLOCATION_TIMEOUT_IN_MS
        }
      );
    }
  }
}
