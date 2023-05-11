import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoordinateParserService {
  public parse(value: string): {x: number; y: number} | undefined {
    const isolatedString = value.replace(/ /g, '');

    return this.isValidCoordinatePair(isolatedString);
  }

  private isValidCoordinatePair(value: string): {x: number; y: number} | undefined {
    const coordinatePairPattern = /^(?<xCoord>\d+(?:\.\d+)?)[,;/](?<yCoord>\d+(?:\.\d+)?)$/;
    const match = value.match(coordinatePairPattern);

    if (match && match.groups && match.groups['xCoord'] && match.groups['yCoord']) {
      return {x: Number(match.groups['xCoord']), y: Number(match.groups['yCoord'])};
    }

    return undefined;
  }
}
