import {TestBed} from '@angular/core/testing';

import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.module';
import {provideMockStore} from '@ngrx/store/testing';
import {MapService} from '../interfaces/map.service';
import {InternalDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MinimalGeometriesUtils} from '../../testing/map-testing/minimal-geometries.utils';

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
      const mapServiceSpy = spyOn(mapService, 'clearInternalDrawingLayer').and.callThrough();

      service.clearFeatureQueryLocation();

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.FeatureQueryLocation);
    });
  });

  describe('drawFeatureInfoHighlight', () => {
    it('calls mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceSpy = spyOn(mapService, 'addGeometryToInternalDrawingLayer').and.callThrough();
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawFeatureInfoHighlight(mockGeometry);

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(mockGeometry, InternalDrawingLayer.FeatureHighlight);
    });
  });

  describe('clearFeatureInfoHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = spyOn(mapService, 'clearInternalDrawingLayer').and.callThrough();

      service.clearFeatureInfoHighlight();

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.FeatureHighlight);
    });
  });

  describe('clearDataDownloadSelection', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = spyOn(mapService, 'clearInternalDrawingLayer').and.callThrough();

      service.clearDataDownloadSelection();

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.Selection);
    });
  });

  describe('stopDrawPrintPreview', () => {
    it('calls mapService.stopDrawPrintPreview', () => {
      const mapServiceSpy = spyOn(mapService, 'stopDrawPrintPreview').and.callThrough();

      service.stopDrawPrintPreview();

      expect(mapServiceSpy).toHaveBeenCalledOnceWith();
    });
  });

  describe('drawFeatureQueryLocation', () => {
    it('clears the internal layer and calls mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceSpy = spyOn(mapService, 'addGeometryToInternalDrawingLayer').and.callThrough();
      const selfServiceSpy = spyOn(service, 'clearFeatureQueryLocation').and.callThrough();
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawFeatureQueryLocation(mockGeometry);

      expect(selfServiceSpy).toHaveBeenCalledOnceWith();
      expect(mapServiceSpy).toHaveBeenCalledOnceWith(mockGeometry, InternalDrawingLayer.FeatureQueryLocation);
    });
  });

  describe('startDrawPrintPreview', () => {
    it('calls mapService.startDrawPrintPreview with the correct params', async () => {
      const mapServiceSpy = spyOn(mapService, 'startDrawPrintPreview').and.callThrough();
      const extentWidth = 1337;
      const extentHeight = 42;
      const rotation = 9000;

      await service.startDrawPrintPreview(extentWidth, extentHeight, rotation);

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(extentWidth, extentHeight, rotation);
    });
  });

  describe('drawSearchResultHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer and mapService.addGeometryToInternalDrawingLayer with the geometry and correct layer', () => {
      const mapServiceAddGeometrySpy = spyOn(mapService, 'addGeometryToInternalDrawingLayer').and.callThrough();
      const mapServiceClearSpy = spyOn(mapService, 'clearInternalDrawingLayer').and.callThrough();
      const mockGeometry = MinimalGeometriesUtils.getMinimalLineString(2056);

      service.drawSearchResultHighlight(mockGeometry);

      expect(mapServiceClearSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.SearchResultHighlight);
      expect(mapServiceAddGeometrySpy).toHaveBeenCalledOnceWith(mockGeometry, InternalDrawingLayer.SearchResultHighlight);
    });
  });

  describe('clearSearchResultHighlight', () => {
    it('calls mapService.clearInternalDrawingLayer with the correct layer', () => {
      const mapServiceSpy = spyOn(mapService, 'clearInternalDrawingLayer').and.callThrough();

      service.clearSearchResultHighlight();

      expect(mapServiceSpy).toHaveBeenCalledOnceWith(InternalDrawingLayer.SearchResultHighlight);
    });
  });
});
