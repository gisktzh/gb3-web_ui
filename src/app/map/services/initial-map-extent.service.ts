import {selectScreenMode} from '../../state/app/reducers/app-layout.reducer';
import {Store} from '@ngrx/store';
import {Injectable, inject} from '@angular/core';
import {MapConstants} from '../../shared/constants/map.constants';
import {defaultMapConfig} from '../../shared/configs/map.config';
import {Coordinate} from '../../shared/interfaces/coordinate.interface';
import {BoundingBox, InitialMapPadding} from '../../state/map/states/map-config.state';
import {MapViewPadding} from '../../shared/interfaces/map-view-padding.interface';

@Injectable({
  providedIn: 'root',
})
export class InitialMapExtentService {
  private readonly store = inject(Store);

  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  public calculateInitialExtent(): {x: number; y: number; scale: number} {
    const viewExtentPadding =
      this.screenMode() === 'mobile' ? defaultMapConfig.initialMapPaddingMobile : defaultMapConfig.initialMapPadding;
    return this.calculateExtent(viewExtentPadding, false);
  }

  /**
   * Calculates the initial extent for a MapView that applies its own padding. Mobile keeps using the legacy calculation because the
   * mobile map does not opt into MapView padding.
   */
  public calculateInitialExtentForPaddedView(viewPadding: MapViewPadding = defaultMapConfig.initialMapPadding): {
    x: number;
    y: number;
    scale: number;
  } {
    if (this.screenMode() === 'mobile') {
      return this.calculateInitialExtent();
    }

    return this.calculateExtent(viewPadding, true);
  }

  private calculateExtent(viewExtentPadding: InitialMapPadding, isPaddingAppliedByMapView: boolean) {
    const min = defaultMapConfig.initialBoundingBox.min;
    const max = defaultMapConfig.initialBoundingBox.max;

    const boundingBoxWidth = max.x - min.x;
    const boundingBoxHeight = max.y - min.y;

    const mapWidth = window.innerWidth;
    const mapHeight = this.screenMode() === 'mobile' ? window.innerHeight : window.innerHeight - MapConstants.NAV_BAR_HEIGHT;

    const viewportWidth = Math.max(1, mapWidth - viewExtentPadding.left - viewExtentPadding.right);
    const viewportHeight = Math.max(1, mapHeight - viewExtentPadding.top - viewExtentPadding.bottom);

    const screenAspectRatio = viewportWidth / viewportHeight;
    const boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight;

    let resolution: number;
    if (boundingBoxAspectRatio > screenAspectRatio) {
      resolution = boundingBoxWidth / viewportWidth;
    } else {
      resolution = boundingBoxHeight / viewportHeight;
    }

    const {x, y} = isPaddingAppliedByMapView
      ? {x: (min.x + max.x) / 2, y: (min.y + max.y) / 2}
      : this.getCenter(resolution, viewExtentPadding, {min, max});
    const scale = resolution * MapConstants.DPI * MapConstants.INCHES_PER_UNIT.m;
    return {x, y, scale};
  }

  private getCenter(resolution: number, viewExtentPadding: InitialMapPadding, boundingBox: BoundingBox): Coordinate {
    const extentLeft = boundingBox.min.x - viewExtentPadding.left * resolution;
    const extentRight = boundingBox.max.x + viewExtentPadding.right * resolution;
    const x = (extentLeft + extentRight) / 2;

    const extentBottom = boundingBox.min.y - viewExtentPadding.bottom * resolution;
    const extentTop = boundingBox.max.y + viewExtentPadding.top * resolution;
    const y = (extentBottom + extentTop) / 2;

    return {x, y};
  }
}
