import GraphicHit = __esri.GraphicHit;
import {HitTestSelectionUtils} from './hit-test-selection.utils';
import Polygon from '@arcgis/core/geometry/Polygon';
import {UnsupportedGeometryType} from '../errors/esri.errors';

describe('HitTestSelectionUtils', () => {
  it('should return the first point hit', () => {
    const hits: GraphicHit[] = [
      {
        graphic: {
          geometry: {
            type: 'point',
          },
        },
      },
      {
        graphic: {
          geometry: {
            type: 'polyline',
          },
        },
      },
      {
        graphic: {
          geometry: {
            type: 'polygon',
          },
        },
      },
    ] as unknown as GraphicHit[];

    const actual = HitTestSelectionUtils.selectFeatureFromHitTestResult(hits);
    expect(actual).toBe(hits[0].graphic);
  });
  it('should return the first line hit', () => {
    const hits: GraphicHit[] = [
      {
        graphic: {
          geometry: {
            type: 'polyline',
          },
        },
      },
      {
        graphic: {
          geometry: {
            type: 'polygon',
          },
        },
      },
    ] as unknown as GraphicHit[];

    const actual = HitTestSelectionUtils.selectFeatureFromHitTestResult(hits);
    expect(actual).toBe(hits[0].graphic);
  });
  it('should return the smallest polygon hit', () => {
    const hits: GraphicHit[] = [
      {
        graphic: {
          geometry: new Polygon({
            spatialReference: {wkid: 4326},
            rings: [
              [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
                [0, 0],
              ],
            ],
          }),
        },
      },
      {
        graphic: {
          geometry: new Polygon({
            spatialReference: {wkid: 4326},
            rings: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          }),
        },
      },
      {
        graphic: {
          geometry: new Polygon({
            spatialReference: {wkid: 4326},
            rings: [
              [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
                [0, 0],
              ],
            ],
          }),
        },
      },
    ] as unknown as GraphicHit[];

    const actual = HitTestSelectionUtils.selectSmallestPolygonFromHitTestResult(hits);
    expect(actual).toBe(hits[1].graphic);
  });
  it('should return the first hit if no point, line or polygon hit', () => {
    const hits: GraphicHit[] = [
      {
        graphic: {
          geometry: {
            type: 'extent',
          },
        },
      },
      {
        graphic: {
          geometry: {
            type: 'mesh',
          },
        },
      },
      {
        graphic: {
          geometry: {
            type: 'multipoint',
          },
        },
      },
    ] as unknown as GraphicHit[];

    const expectedError = new UnsupportedGeometryType('extent');
    expect(() => HitTestSelectionUtils.selectFeatureFromHitTestResult(hits)).toThrow(expectedError);
  });
});
