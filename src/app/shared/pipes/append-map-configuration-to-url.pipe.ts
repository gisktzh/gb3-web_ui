import {Pipe, PipeTransform} from '@angular/core';
import {MapConfigState} from '../../state/map/states/map-config.state';

/**
 * Expects a URL and appends the center and scale to it. If the string cannot be parsed, returns the string as is.
 */
@Pipe({
  name: 'appendMapConfigurationToUrl',
})
export class AppendMapConfigurationToUrlPipe implements PipeTransform {
  public transform(value: string, mapConfigState?: MapConfigState): string {
    if (!mapConfigState) {
      return value;
    }

    try {
      const url = new URL(value);
      url.searchParams.append('x', mapConfigState.center.x.toString());
      url.searchParams.append('y', mapConfigState.center.y.toString());
      url.searchParams.append('scale', mapConfigState.scale.toString());

      return url.toString();
    } catch (e) {
      return value;
    }
  }
}
