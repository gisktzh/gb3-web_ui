import {TestBed} from '@angular/core/testing';

import {ELEVATION_PROFILE_LOCATION_IDENTIFIER, MapDrawingService} from './map-drawing.service';
import {provideMockStore} from '@ngrx/store/testing';
import {MapService} from '../interfaces/map.service';
import {InternalDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MinimalGeometriesUtils} from '../../testing/map-testing/minimal-geometries.utils';
import {GeometryWithSrs, PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
import {MAP_SERVICE} from '../../app.tokens';

describe('MapDrawingService', () => {
  let service: MapDrawingService;
  let mapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore(), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    service = TestBed.inject(MapDrawingService);
    mapService = TestBed.inject(MAP_SERVICE);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('clearFeatureQueryLocation', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.clearFeatureQueryLocation();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.FeatureQueryLocation);
    });
  });

  describe('drawFeatureInfoHighlight', () => {
    it('calls mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawFeatureInfoHighlight(mockGeometry);

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(mockGeometry, InternalDrawingLayer.FeatureHighlight);
    });
  });

  describe('clearFeatureInfoHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.clearFeatureInfoHighlight();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.FeatureHighlight);
    });
  });

  describe('drawStatisticsHighlights', () => {
    it('flattens nested geometry collections, inherits their SRS, and deduplicates identical geometries', () => {
      const add = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const clear = vi.spyOn(mapService, 'clearInternalDrawingLayer');
      const point = MinimalGeometriesUtils.getMinimalPoint(2056);
      const line = MinimalGeometriesUtils.getMinimalLineString(2056);
      const polygon = MinimalGeometriesUtils.getMinimalPolygon(2056);
      const collection: GeometryWithSrs = {
        type: 'GeometryCollection',
        srs: 2056,
        geometries: [
          {type: point.type, coordinates: point.coordinates},
          {
            type: 'GeometryCollection',
            geometries: [
              {type: line.type, coordinates: line.coordinates},
              {type: polygon.type, coordinates: polygon.coordinates},
              {type: 'GeometryCollection', geometries: []},
            ],
          },
        ],
      };
      const original = structuredClone(collection);

      service.drawStatisticsHighlights([collection, point]);

      expect(clear).toHaveBeenCalledExactlyOnceWith(InternalDrawingLayer.StatisticsHighlight);
      expect(add.mock.calls).toEqual([
        [point, InternalDrawingLayer.StatisticsHighlight],
        [line, InternalDrawingLayer.StatisticsHighlight],
        [polygon, InternalDrawingLayer.StatisticsHighlight],
      ]);
      expect(clear.mock.invocationCallOrder[0]).toBeLessThan(add.mock.invocationCallOrder[0]);
      expect(collection).toEqual(original);
    });

    it('preserves supported multipart geometries rather than passing collections to the renderer', () => {
      const add = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const geometries = [
        MinimalGeometriesUtils.getMinimalMultiPoint(2056),
        MinimalGeometriesUtils.getMinimalMultiLineString(2056),
        MinimalGeometriesUtils.getMinimalMultiPolygon(2056),
      ];

      service.drawStatisticsHighlights(geometries);

      expect(add.mock.calls).toEqual(geometries.map((geometry) => [geometry, InternalDrawingLayer.StatisticsHighlight]));
    });

    it.each([
      {name: 'no geometries', geometries: []},
      {name: 'an empty collection', geometries: [{type: 'GeometryCollection', geometries: [], srs: 2056}]},
      {name: 'an empty multipoint', geometries: [{type: 'MultiPoint', coordinates: [], srs: 2056}]},
    ] satisfies {name: string; geometries: GeometryWithSrs[]}[])('clears previous highlights for $name', ({geometries}) => {
      const add = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const clear = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.drawStatisticsHighlights(geometries);

      expect(clear).toHaveBeenCalledExactlyOnceWith(InternalDrawingLayer.StatisticsHighlight);
      expect(add).not.toHaveBeenCalled();
    });
  });

  describe('clearStatisticsHighlights', () => {
    it('clears only the dedicated highlight layer, leaving the selection area and feature highlights untouched', () => {
      const clear = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.clearStatisticsHighlights();

      expect(clear).toHaveBeenCalledExactlyOnceWith(InternalDrawingLayer.StatisticsHighlight);
    });
  });

  describe('clearDataDownloadSelection', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.clearDataDownloadSelection();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.Selection);
    });
  });

  describe('stopDrawPrintPreview', () => {
    it('calls mapService.stopDrawPrintPreview', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'stopDrawPrintPreview');

      service.stopDrawPrintPreview();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith();
    });
  });

  describe('drawFeatureQueryLocation', () => {
    it('clears the internal layer and calls mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const selfServiceSpy = vi.spyOn(service, 'clearFeatureQueryLocation');
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawFeatureQueryLocation(mockGeometry);

      expect(selfServiceSpy).toHaveBeenCalledTimes(1);

      expect(selfServiceSpy).toHaveBeenCalledWith();
      expect(mapServiceSpy).toHaveBeenCalledTimes(1);
      expect(mapServiceSpy).toHaveBeenCalledWith(mockGeometry, InternalDrawingLayer.FeatureQueryLocation);
    });
  });

  describe('startDrawPrintPreview', () => {
    it('calls mapService.startDrawPrintPreview with the correct params', async () => {
      const mapServiceSpy = vi.spyOn(mapService, 'startDrawPrintPreview');
      const extentWidth = 1337;
      const extentHeight = 42;
      const rotation = 9000;

      await service.startDrawPrintPreview(extentWidth, extentHeight, rotation);

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(extentWidth, extentHeight, rotation);
    });
  });

  describe('drawSearchResultHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer and mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceAddGeometrySpy = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');
      const mapServiceClearSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawSearchResultHighlight(mockGeometry);

      expect(mapServiceClearSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceClearSpy).toHaveBeenCalledWith(InternalDrawingLayer.SearchResultHighlight);
      expect(mapServiceAddGeometrySpy).toHaveBeenCalledTimes(1);
      expect(mapServiceAddGeometrySpy).toHaveBeenCalledWith(mockGeometry, InternalDrawingLayer.SearchResultHighlight);
    });
  });

  describe('clearSearchResultHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'clearInternalDrawingLayer');

      service.clearSearchResultHighlight();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.SearchResultHighlight);
    });
  });

  describe('removeElevationProfileHoverLocation', () => {
    it('calls mapService.removeGeometryFromInternalDrawingLayer with the correct id and layer', () => {
      const mapServiceSpy = vi.spyOn(mapService, 'removeGeometryFromInternalDrawingLayer');

      service.removeElevationProfileHoverLocation();

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(InternalDrawingLayer.ElevationProfile, ELEVATION_PROFILE_LOCATION_IDENTIFIER);
    });
  });

  describe('drawElevationProfileHoverLocation', () => {
    const mockLocation: PointWithSrs = {type: 'Point', coordinates: [1, 2], srs: 2056};

    it('uses mapDrawingService.removeElevationProfileHoverLocation to clear the location before drawing a new object', () => {
      const selfServiceSpy = vi.spyOn(service, 'removeElevationProfileHoverLocation');
      const mapServiceSpy = vi.spyOn(mapService, 'addGeometryToInternalDrawingLayer');

      service.drawElevationProfileHoverLocation(mockLocation);

      expect(mapServiceSpy).toHaveBeenCalledTimes(1);

      expect(mapServiceSpy).toHaveBeenCalledWith(
        mockLocation,
        InternalDrawingLayer.ElevationProfile,
        ELEVATION_PROFILE_LOCATION_IDENTIFIER,
      );
      expect(selfServiceSpy).toHaveBeenCalledTimes(1);
      expect(selfServiceSpy).toHaveBeenCalledWith();
    });
  });
});
