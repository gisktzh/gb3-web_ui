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
    // Create two matching groups (xCoord & yCoord) of a random amount of digits, seperated by , or ; or /; and ONLY if both groups have
    // a match. E.g. "5/456.123" will match (xCoord = 5; yCoord = 456.123), whereas "5.1234,", "1112", "5/5/4" or "5/5a" will not match.
    const coordinatePairPattern = /^(?<xCoord>\d+(?:\.\d+)?)[,;/](?<yCoord>\d+(?:\.\d+)?)$/;
    const match = value.match(coordinatePairPattern);

    if (match && match.groups && match.groups['xCoord'] && match.groups['yCoord']) {
      return {type: 'Point', coordinates: [Number(match.groups['xCoord']), Number(match.groups['yCoord'])], srs: 2056};
    }

    return undefined;
  }
}
