import {selectScreenMode} from '../../state/app/reducers/app-layout.reducer';
import {Store} from '@ngrx/store';
import {Injectable, inject} from '@angular/core';
import {MapConstants} from '../../shared/constants/map.constants';
import {defaultMapConfig} from '../../shared/configs/map.config';
import {Coordinate} from '../../shared/interfaces/coordinate.interface';
import {BoundingBox, InitialMapPadding} from '../../state/map/states/map-config.state';

@Injectable({
  providedIn: 'root',
})
export class InitialMapExtentService {
  private readonly store = inject(Store);

  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  public calculateInitialExtent(): {x: number; y: number; scale: number} {
    const min = defaultMapConfig.initialBoundingBox.min;
    const max = defaultMapConfig.initialBoundingBox.max;

    const boundingBoxWidth = max.x - min.x;
    const boundingBoxHeight = max.y - min.y;

    const viewExtentPadding =
      this.screenMode() === 'mobile' ? defaultMapConfig.initialMapPaddingMobile : defaultMapConfig.initialMapPadding;

    const mapWidth = window.innerWidth;
    const mapHeight = this.screenMode() === 'mobile' ? window.innerHeight : window.innerHeight - MapConstants.NAV_BAR_HEIGHT;

    const viewportWidth = mapWidth - viewExtentPadding.left - viewExtentPadding.right;
    const viewportHeight = mapHeight - viewExtentPadding.top - viewExtentPadding.bottom;

    const screenAspectRatio = viewportWidth / viewportHeight;
    const boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight;

    let resolution: number;
    if (boundingBoxAspectRatio > screenAspectRatio) {
      resolution = boundingBoxWidth / viewportWidth;
    } else {
      resolution = boundingBoxHeight / viewportHeight;
    }

    const {x, y} = this.getCenter(resolution, viewExtentPadding, {min, max});
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
