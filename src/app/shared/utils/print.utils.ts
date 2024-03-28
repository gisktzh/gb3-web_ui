import {MapConstants} from '../constants/map.constants';
import {Gb2Constants} from '../constants/gb2.constants';
import {PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';
import {Coordinates} from '../interfaces/coordinate.interface';

export class PrintUtils {
  public static calculateGb2PrintPreviewExtent(width: number, height: number, scale: number): {extentWidth: number; extentHeight: number} {
    const resolution = scale / Gb2Constants.PRINT_DPI / MapConstants.INCHES_PER_UNIT.m;
    return {
      extentWidth: width * resolution,
      extentHeight: height * resolution,
    };
  }

  public static createPrintPreviewArea(center: Coordinates, extentWidth: number, extentHeight: number): PolygonWithSrs {
    const halfExtentWidth = extentWidth / 2;
    const halfExtentHeight = extentHeight / 2;
    const printPreviewArea: PolygonWithSrs = {
      srs: MapConstants.DEFAULT_SRS,
      type: 'Polygon',
      coordinates: [
        [
          [center.x - halfExtentWidth, center.y - halfExtentHeight],
          [center.x - halfExtentWidth, center.y + halfExtentHeight],
          [center.x + halfExtentWidth, center.y + halfExtentHeight],
          [center.x + halfExtentWidth, center.y - halfExtentHeight],
        ],
      ],
    };
    return printPreviewArea;
  }
}
