import {MapConstants} from '../constants/map.constants';
import {Gb2Constants} from '../constants/gb2.constants';
import {PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';

export class PrintUtils {
  public static calculateGb2PrintPreviewExtent(width: number, height: number, scale: number): {extentWidth: number; extentHeight: number} {
    const resolution = scale / Gb2Constants.PRINT_DPI / MapConstants.INCHES_PER_UNIT.m;
    return {
      extentWidth: width * resolution,
      extentHeight: height * resolution
    };
  }

  public static createPrintPreviewArea(center: {x: number; y: number}, extentWidth: number, extentHeight: number): PolygonWithSrs {
    const printPreviewArea: PolygonWithSrs = {
      srs: MapConstants.DEFAULT_SRS,
      type: 'Polygon',
      coordinates: [
        [
          [center.x - extentWidth, center.y - extentHeight],
          [center.x - extentWidth, center.y + extentHeight],
          [center.x + extentWidth, center.y + extentHeight],
          [center.x + extentWidth, center.y - extentHeight]
        ]
      ]
    };
    return printPreviewArea;
  }
}
