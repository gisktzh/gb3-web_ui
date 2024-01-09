import Color from '@arcgis/core/Color';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Graphic from '@arcgis/core/Graphic';
import {MapConstants} from '../../../../shared/constants/map.constants';
import Polygon from '@arcgis/core/geometry/Polygon';
import {UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {UnsupportedGeometryType} from '../errors/esri.errors';
import {InternalDrawingRepresentationToEsriGraphicUtils} from './internal-drawing-representation-to-esri-graphic.utils';
import {MinimalGeometriesUtils} from '../../../../testing/map-testing/minimal-geometries.utils';

describe('InternalDrawingRepresentationToEsriGraphicUtils', () => {
  it('converts a GB3 internal drawing representation to an esri graphic', () => {
    const fillColorHex = '#abcdef';
    const strokeColorHex = '#080085';
    const strokeWidth = 42;
    const id = 'testidone';
    const labelText = 'labeltext';
    const internalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
      type: 'Feature',
      source: UserDrawingLayer.Drawings,
      properties: {
        style: {
          fillColor: fillColorHex,
          fillOpacity: 1,
          strokeWidth: strokeWidth,
          strokeOpacity: 1,
          strokeColor: strokeColorHex,
          type: 'polygon',
        },
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
      },
      geometry: {
        type: 'MultiPolygon',
        srs: 4326,
        coordinates: [
          [
            [
              [0, 0],
              [42, 0],
              [0, 69],
              [0, 0],
            ],
          ],
        ],
      },
      labelText: labelText,
    };

    const actual = InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation);
    const expected = new Graphic({
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: id,
      },
      geometry: new Polygon({
        spatialReference: {wkid: 4326},
        rings: [
          [
            [0, 0],
            [42, 0],
            [0, 69],
            [0, 0],
          ],
        ],
      }),
      symbol: new SimpleFillSymbol({
        color: new Color(Color.fromHex(fillColorHex)),
        outline: {width: strokeWidth, color: new Color(strokeColorHex)},
      }),
    });

    expect(actual).toEqual(expected);
  });

  it('throws an error if the geometry type is not supported', () => {
    const internalDrawingRepresentation = {
      type: 'Feature',
      source: UserDrawingLayer.Drawings,
      properties: {
        style: {
          type: 'polygon',
          fillColor: '#000000',
          fillOpacity: 1,
          strokeWidth: 1,
          strokeOpacity: 1,
          strokeColor: '#000000',
        },
        [MapConstants.DRAWING_IDENTIFIER]: 'nope',
      },
      geometry: {
        type: 'GeometryCollection',
        srs: 2056,
        geometries: [MinimalGeometriesUtils.getMinimalPoint(2056), MinimalGeometriesUtils.getMinimalPolygon(2056)],
      },
    } as unknown as Gb3StyledInternalDrawingRepresentation;
    expect(() => InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation)).toThrow(
      new UnsupportedGeometryType('GeometryCollection'),
    );
  });
});
