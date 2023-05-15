import {Injectable} from '@angular/core';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';

@Injectable({
  providedIn: 'root'
})
export class CoordinateParserService {
  public parse(value: string): PointWithSrs | undefined {
    const isolatedString = value.replace(/ /g, '');

    return this.isValidCoordinatePair(isolatedString);
  }

  private isValidCoordinatePair(value: string): PointWithSrs | undefined {
    const coordinatePairPattern = /^(?<xCoord>\d+(?:\.\d+)?)[,;/](?<yCoord>\d+(?:\.\d+)?)$/;
    const match = value.match(coordinatePairPattern);

    if (match && match.groups && match.groups['xCoord'] && match.groups['yCoord']) {
      return {type: 'Point', coordinates: [Number(match.groups['xCoord']), Number(match.groups['yCoord'])], srs: 2056};
    }

    return undefined;
  }
}
