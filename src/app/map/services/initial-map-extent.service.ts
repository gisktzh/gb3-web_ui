import {ScreenMode} from '../../shared/types/screen-size.type';
import {selectScreenMode} from '../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {Injectable, OnDestroy} from '@angular/core';
import {MapConstants} from '../../shared/constants/map.constants';
import {defaultMapConfig} from '../../shared/configs/map.config';

const NAV_BAR_HEIGHT = 72;

@Injectable({
  providedIn: 'root',
})
export class InitialMapExtentService implements OnDestroy {
  public screenMode: ScreenMode = 'regular';
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public calculateInitialExtent(): {x: number; y: number; scale: number} {
    const min = defaultMapConfig.initialBoundingBox.min;
    const max = defaultMapConfig.initialBoundingBox.max;

    const zurichWidth = max.x - min.x;
    const zurichHeight = max.y - min.y;

    const viewExtentPadding = this.screenMode !== 'mobile' ? defaultMapConfig.initialMapPadding : defaultMapConfig.initialMapPaddingMobile;

    const mapWidth = window.innerWidth;
    const mapHeight = this.screenMode !== 'mobile' ? window.innerHeight - NAV_BAR_HEIGHT : window.innerHeight;

    const viewportWidth = mapWidth - viewExtentPadding.left - viewExtentPadding.right;
    const viewportHeight = mapHeight - viewExtentPadding.top - viewExtentPadding.bottom;

    const screenAspectRatio = viewportWidth / viewportHeight;
    const zurichAspectRatio = zurichWidth / zurichHeight;

    let resolution: number;
    let y: number;
    let x: number;
    if (zurichAspectRatio > screenAspectRatio) {
      resolution = zurichWidth / viewportWidth;

      x = this.getCenterForRestrictingAxis(resolution, viewExtentPadding.left, viewExtentPadding.right, min.x, max.x);
      y = this.getCenterForNonRestrictingAxis(
        resolution,
        viewExtentPadding.bottom,
        viewExtentPadding.top,
        zurichWidth,
        viewportWidth,
        min.y,
        max.y,
      );
    } else {
      resolution = zurichHeight / viewportHeight;

      y = this.getCenterForRestrictingAxis(resolution, viewExtentPadding.bottom, viewExtentPadding.top, min.y, max.y);
      x = this.getCenterForNonRestrictingAxis(
        resolution,
        viewExtentPadding.left,
        viewExtentPadding.right,
        zurichWidth,
        viewportWidth,
        min.x,
        max.x,
      );
    }
    const scale = resolution * MapConstants.DPI * MapConstants.INCHES_PER_UNIT.m;

    return {x, y, scale};
  }

  private getCenterForRestrictingAxis(
    resolution: number,
    paddingLeftOrBottom: number,
    paddingRightOrTop: number,
    bboxLeftOrBottom: number,
    bboxRightOrTop: number,
  ): number {
    const extentLeftOrBottom = bboxLeftOrBottom - paddingLeftOrBottom * resolution;
    const extentRightOrTop = bboxRightOrTop + paddingRightOrTop * resolution;

    return (extentLeftOrBottom + extentRightOrTop) / 2;
  }

  private getCenterForNonRestrictingAxis(
    resolution: number,
    paddingLeftOrBottom: number,
    paddingRightOrTop: number,
    zurichWidth: number,
    viewportWidth: number,
    bboxLeftOrBottom: number,
    bboxRightOrTop: number,
  ): number {
    const zurichWidthInPixels = zurichWidth / resolution;
    const leftoverSpace = viewportWidth - zurichWidthInPixels;
    const padding = (leftoverSpace / 2) * resolution;

    const extentLeftOrBottom = bboxLeftOrBottom - padding - paddingLeftOrBottom * resolution;
    const extentRightOrTop = bboxRightOrTop + padding + paddingRightOrTop * resolution;

    return (extentLeftOrBottom + extentRightOrTop) / 2;
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
