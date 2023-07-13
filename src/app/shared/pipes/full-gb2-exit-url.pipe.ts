import {Pipe, PipeTransform} from '@angular/core';
import {MapConfigState} from '../../state/map/states/map-config.state';

/**
 * Expects a GB2 URL and a mapconfigstate and returns the GB2 URL with center coordinates and scale attached.
 *
 * Due to the specification, we can safely (™) assume that the URLs always contain the ? already since that's required for GB2 access.
 * That's why we don't need to cast the string to an URL.
 */
@Pipe({
  name: 'fullGb2ExitUrl'
})
export class FullGb2ExitUrlPipe implements PipeTransform {
  public transform(value: string, mapConfigState?: MapConfigState): string {
    if (!mapConfigState) {
      return value;
    }

    return `${value}&x=${mapConfigState.center.x}&y=${mapConfigState.center.y}&scale=${mapConfigState.scale}`;
  }
}
