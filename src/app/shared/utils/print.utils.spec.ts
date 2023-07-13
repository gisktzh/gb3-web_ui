import {PrintUtils} from './print.utils';
import {Gb2Constants} from '../constants/gb2.constants';
import {MapConstants} from '../constants/map.constants';

describe('PrintUtils', () => {
  it(`should calculate the print preview extent correctly`, () => {
    const width = 100;
    const height = 100;
    const scale = 1;
    const expectedResolution = scale / Gb2Constants.PRINT_DPI / MapConstants.INCHES_PER_UNIT.m;
    const expectedWidth = expectedResolution * width;
    const expectedHeight = expectedResolution * height;
    const actualExtent = PrintUtils.calculateGb2PrintPreviewExtent(width, height, scale);
    expect(actualExtent.extentWidth).toBe(actualExtent.extentHeight); // same width and height should result in the same extentWidth and extent height
    expect(actualExtent).toEqual({extentWidth: expectedWidth, extentHeight: expectedHeight});

    const differentScale = 2;
    const actualExtentWithDifferentScale = PrintUtils.calculateGb2PrintPreviewExtent(width, height, differentScale);
    expect(actualExtentWithDifferentScale).toEqual({
      extentWidth: expectedWidth * differentScale,
      extentHeight: expectedHeight * differentScale
    });
  });

  it(`should create the print preview area correctly`, () => {
    expect(PrintUtils.createPrintPreviewArea({x: 10, y: -20}, 2, 6)).toEqual({
      srs: 2056,
      type: 'Polygon',
      coordinates: [
        [
          [9, -23],
          [9, -17],
          [11, -17],
          [11, -23]
        ]
      ]
    });
  });
});
