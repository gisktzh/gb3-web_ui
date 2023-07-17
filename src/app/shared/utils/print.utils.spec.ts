import {PrintUtils} from './print.utils';
import {Gb2Constants} from '../constants/gb2.constants';
import {MapConstants} from '../constants/map.constants';
import {PolygonWithSrs} from '../interfaces/geojson-types-with-srs.interface';

describe('PrintUtils', () => {
  it(`should calculate the print preview extent according to the given formula`, () => {
    const width = 100;
    const height = 100;
    const scale = 1;
    // formula
    const expectedResolution = scale / Gb2Constants.PRINT_DPI / MapConstants.INCHES_PER_UNIT.m;
    const expectedWidth = expectedResolution * width;
    const expectedHeight = expectedResolution * height;

    const actualExtent = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale);
    expect(actualExtent).toEqual({extentWidth: expectedWidth, extentHeight: expectedHeight});
    // same width and height should result in the same extent width and extent height
    expect(actualExtent.extentWidth).toBe(actualExtent.extentHeight);
  });

  it(`should calculate the print preview extent with linear factors`, () => {
    const width = 20;
    const height = 10;
    const scale = 1;

    const expectedFactor = 3;

    const actualExtent = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale);
    const actualExtentWithDifferentWidth = PrintUtils.calculateGb2PrintPreviewExtent(width * expectedFactor, height, scale);
    const actualExtentWithDifferentHeight = PrintUtils.calculateGb2PrintPreviewExtent(width, height * expectedFactor, scale);
    const actualExtentWithDifferentScale = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale * expectedFactor);

    expect(actualExtentWithDifferentWidth).toEqual({
      extentWidth: actualExtent.extentWidth * expectedFactor,
      extentHeight: actualExtent.extentHeight,
    });
    expect(actualExtentWithDifferentHeight).toEqual({
      extentWidth: actualExtent.extentWidth,
      extentHeight: actualExtent.extentHeight * expectedFactor,
    });
    expect(actualExtentWithDifferentScale).toEqual({
      extentWidth: actualExtent.extentWidth * expectedFactor,
      extentHeight: actualExtent.extentHeight * expectedFactor,
    });
  });

  it(`should create the print preview area correctly`, () => {
    const actual = PrintUtils.createPrintPreviewArea({x: 10, y: -20}, 2, 6);
    const expected: PolygonWithSrs = {
      srs: 2056,
      type: 'Polygon',
      coordinates: [
        [
          [9, -23],
          [9, -17],
          [11, -17],
          [11, -23],
        ],
      ],
    };
    expect(actual).toEqual(expected);
  });
});
