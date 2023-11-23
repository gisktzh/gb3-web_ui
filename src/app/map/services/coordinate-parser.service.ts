import {Injectable} from '@angular/core';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';

@Injectable({
  providedIn: 'root',
})
export class CoordinateParserService {
  public parse(value: string): PointWithSrs | undefined {
    const sanitizedString = this.sanitizeInput(value);

    return this.isValidCoordinatePair(sanitizedString);
  }

  /**
   * Performs a basic sanitization of the input. It replaces
   * * all whitespaces
   * * all inverted commas (and lookalikes, i.e. '`’´)
   * with an empty string. This allows for various number format inputs as well as separators.
   * @param value
   * @private
   */
  private sanitizeInput(value: string): string {
    return value.replace(/['`’´]/g, '');
  }

  /**
   * Checks whether a string contains a valid coordinate pair. This includes:
   * * seperated via (arbitrary amount of) whitespaces, e.g. 123456    789123
   * * seperated via either , ; or /
   * In the latter case, we also remove whitespaces to account for things like
   * * 123456   / 789123
   * @param value
   * @private
   */
  private isValidCoordinatePair(value: string): PointWithSrs | undefined {
    const matches = value.match(/(\s+|\S+)/g);

    let coordinatePairPattern: RegExp;
    if (matches?.length === 3) {
      coordinatePairPattern = /^(?<xCoord>\d+(?:\.\d+)?)\s+(?<yCoord>\d+(?:\.\d+)?)$/;
    } else {
      coordinatePairPattern = /^(?<xCoord>\d+(?:\.\d+)?)[,;/](?<yCoord>\d+(?:\.\d+)?)$/;
      value = value.replace(/ /g, '');
    }

    // Create two matching groups (xCoord & yCoord) of a random amount of digits, seperated by , or ; or /; and ONLY if both groups have
    // a match. E.g. "5/456.123" will match (xCoord = 5; yCoord = 456.123), whereas "5.1234,", "1112", "5/5/4" or "5/5a" will not match.
    const match = coordinatePairPattern.exec(value);

    if (match?.groups && match.groups['xCoord'] && match.groups['yCoord']) {
      return {type: 'Point', coordinates: [Number(match.groups['xCoord']), Number(match.groups['yCoord'])], srs: 2056};
    }

    return undefined;
  }
}
