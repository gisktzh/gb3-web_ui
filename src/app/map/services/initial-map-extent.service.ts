import {MapConfigState} from '../../state/map/states/map-config.state';
import {ScreenMode} from '../../shared/types/screen-size.type';
import {selectScreenMode} from '../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {Injectable, OnDestroy} from '@angular/core';
import {MapConstants} from '../../shared/constants/map.constants';

@Injectable({
  providedIn: 'root',
})
export class InitialMapExtentService implements OnDestroy {
  public screenMode: ScreenMode = 'regular';
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {
    this.initializeSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public calculateInitialExtent(config: MapConfigState): {x: number; y: number; scale: number} {
    const zurichWidth = config.zurichBoundingBox.xmax - config.zurichBoundingBox.xmin;
    const zurichHeight = config.zurichBoundingBox.ymax - config.zurichBoundingBox.ymin;

    const viewExtentPadding = this.screenMode !== 'mobile' ? config.initialMapPadding : config.initialMapPaddingMobile;

    const mapWidth = window.innerWidth;
    const mapHeight = this.screenMode !== 'mobile' ? window.innerHeight - 72 : window.innerHeight;

    const viewportWidth = mapWidth - viewExtentPadding.left - viewExtentPadding.right;
    const viewportHeight = mapHeight - viewExtentPadding.top - viewExtentPadding.bottom;

    const screenAspectRatio = viewportWidth / viewportHeight;
    const zurichAspectRatio = zurichWidth / zurichHeight;

    let resolution: number;
    let y: number;
    let x: number;
    if (zurichAspectRatio > screenAspectRatio) {
      resolution = zurichWidth / viewportWidth;

      const {extentLeftOrBottom: extentLeft, extentRightOrTop: extentRight} = this.getExtentForRestrictingAxis(
        resolution,
        viewExtentPadding.left,
        viewExtentPadding.right,
        config.zurichBoundingBox.xmin,
        config.zurichBoundingBox.xmax,
      );
      x = (extentLeft + extentRight) / 2;

      const {extentLeftOrBottom: extentBottom, extentRightOrTop: extentTop} = this.getExtentForNonRestrictingAxis(
        resolution,
        viewExtentPadding.bottom,
        viewExtentPadding.top,
        zurichWidth,
        viewportWidth,
        config.zurichBoundingBox.ymin,
        config.zurichBoundingBox.ymax,
      );
      y = (extentTop + extentBottom) / 2;
    } else {
      resolution = zurichHeight / viewportHeight;

      const {extentLeftOrBottom: extentBottom, extentRightOrTop: extentTop} = this.getExtentForRestrictingAxis(
        resolution,
        viewExtentPadding.bottom,
        viewExtentPadding.top,
        config.zurichBoundingBox.ymin,
        config.zurichBoundingBox.ymax,
      );
      y = (extentTop + extentBottom) / 2;

      const {extentLeftOrBottom: extentLeft, extentRightOrTop: extentRight} = this.getExtentForNonRestrictingAxis(
        resolution,
        viewExtentPadding.left,
        viewExtentPadding.right,
        zurichWidth,
        viewportWidth,
        config.zurichBoundingBox.xmin,
        config.zurichBoundingBox.xmax,
      );
      x = (extentLeft + extentRight) / 2;
    }
    const scale = resolution * MapConstants.DPI * MapConstants.INCHES_PER_UNIT.m;

    return {x, y, scale};
  }

  private getExtentForRestrictingAxis(
    resolution: number,
    paddingLeftOrBottom: number,
    paddingRightOrTop: number,
    bboxLeftOrBottom: number,
    bboxRightOrTop: number,
  ) {
    const extentLeftOrBottom = bboxLeftOrBottom - paddingLeftOrBottom * resolution;
    const extentRightOrTop = bboxRightOrTop + paddingRightOrTop * resolution;

    return {extentLeftOrBottom, extentRightOrTop};
  }

  private getExtentForNonRestrictingAxis(
    resolution: number,
    paddingLeftOrBottom: number,
    paddingRightOrTop: number,
    zurichWidth: number,
    viewportWidth: number,
    bboxLeftOrBottom: number,
    bboxRightOrTop: number,
  ) {
    const zurichWidthInPixels = zurichWidth / resolution;
    const leftoverSpace = viewportWidth - zurichWidthInPixels;
    const padding = (leftoverSpace / 2) * resolution;

    const extentLeftOrBottom = bboxLeftOrBottom - padding - paddingLeftOrBottom * resolution;
    const extentRightOrTop = bboxRightOrTop + padding + paddingRightOrTop * resolution;

    return {extentLeftOrBottom, extentRightOrTop};
  }

  private initializeSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
