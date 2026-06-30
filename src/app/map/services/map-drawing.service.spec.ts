import {TestBed} from '@angular/core/testing';

import {ELEVATION_PROFILE_LOCATION_IDENTIFIER, MapDrawingService} from './map-drawing.service';
import {provideMockStore} from '@ngrx/store/testing';
import {MapService} from '../interfaces/map.service';
import {InternalDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MinimalGeometriesUtils} from '../../testing/map-testing/minimal-geometries.utils';
import {PointWithSrs} from '../../shared/interfaces/geojson-types-with-srs.interface';
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
