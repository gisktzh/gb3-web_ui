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
import Polyline from '@arcgis/core/geometry/Polyline';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

describe('InternalDrawingRepresentationToEsriGraphicUtils', () => {
  it('converts a GB3 internal polygon drawing representation to an esri graphic', async () => {
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
        [MapConstants.TOOL_IDENTIFIER]: 'polygon',
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

    const actual = await InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation);
    const expected = new Graphic({
      geometry: new Polygon({
        spatialReference: {wkid: 4326},
        rings: [
          [
            [0, 0],
            [0, 69],
            [42, 0],
            [0, 0],
          ],
        ],
      }),
      symbol: new SimpleFillSymbol({
        color: new Color(Color.fromHex(fillColorHex)!),
        outline: {width: strokeWidth, color: new Color(strokeColorHex)},
      }),
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
        [MapConstants.TOOL_IDENTIFIER]: 'polygon',
      },
    });

    expect(actual.toJSON()).toEqual(expected.toJSON());
  });

  it('converts a GB3 internal line drawing representation to an esri graphic', async () => {
    const strokeColorHex = '#080085';
    const strokeWidth = 42;
    const id = 'testidone';
    const belongsToId = 'testidtwo';
    const labelText = 'labeltext';
    const internalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
      type: 'Feature',
      source: UserDrawingLayer.Measurements,
      properties: {
        style: {
          strokeWidth: strokeWidth,
          strokeOpacity: 1,
          strokeColor: strokeColorHex,
          type: 'line',
        },
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: belongsToId,
        [MapConstants.TOOL_IDENTIFIER]: 'polyline',
      },
      geometry: {
        type: 'LineString',
        srs: 2056,
        coordinates: [
          [0, 0],
          [0, 42],
          [69, 0],
        ],
      },
      labelText: labelText,
    };

    const actual = await InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation);
    const expected = new Graphic({
      geometry: new Polyline({
        spatialReference: {wkid: 2056},
        paths: [
          [
            [0, 0],
            [0, 42],
            [69, 0],
          ],
        ],
      }),
      symbol: new SimpleLineSymbol({
        color: new Color(Color.fromHex(strokeColorHex)!),
        width: strokeWidth,
      }),
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: belongsToId,
        [MapConstants.TOOL_IDENTIFIER]: 'polyline',
      },
    });

    expect(actual.toJSON()).toEqual(expected.toJSON());
  });

  it('converts a GB3 internal point drawing representation to an esri graphic', async () => {
    const fillColorHex = '#abcdef';
    const strokeColorHex = '#080085';
    const strokeWidth = 42;
    const pointRadius = 69;
    const id = 'testidone';
    const internalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
      type: 'Feature',
      source: UserDrawingLayer.Measurements,
      properties: {
        style: {
          fillColor: fillColorHex,
          fillOpacity: 1,
          strokeWidth: strokeWidth,
          strokeOpacity: 1,
          strokeColor: strokeColorHex,
          pointRadius: pointRadius,
          type: 'point',
        },
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
        [MapConstants.TOOL_IDENTIFIER]: 'point',
      },
      geometry: {
        type: 'Point',
        srs: 2056,
        coordinates: [1001, 9337],
      },
      labelText: undefined,
    };

    const actual = await InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation);
    const expected = new Graphic({
      geometry: new Point({
        spatialReference: {wkid: 2056},
        x: 1001,
        y: 9337,
      }),
      symbol: new SimpleMarkerSymbol({
        color: fillColorHex,
        size: pointRadius,
        outline: {
          color: strokeColorHex,
          width: strokeWidth,
        },
      }),
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: id,
        [MapConstants.BELONGS_TO_IDENTIFIER]: undefined,
        [MapConstants.TOOL_IDENTIFIER]: 'point',
      },
    });

    expect(actual.toJSON()).toEqual(expected.toJSON());
  });

  it('throws an error if the geometry type is not supported', async () => {
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

    await expectAsync(InternalDrawingRepresentationToEsriGraphicUtils.convert(internalDrawingRepresentation)).toBeRejectedWith(
      new UnsupportedGeometryType('GeometryCollection'),
    );
  });
});
