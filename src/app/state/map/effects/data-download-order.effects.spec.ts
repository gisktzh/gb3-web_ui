import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAP_SERVICE} from '../../../app.module';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {DataDownloadOrderEffects} from './data-download-order.effects';
import {DataDownloadOrderActions} from '../actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {MapUiActions} from '../actions/map-ui.actions';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {selectActiveTool} from '../reducers/tool.reducer';
import {Order} from '../../../shared/interfaces/geoshop-order.interface';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {selectSelection} from '../reducers/data-download-order.reducer';

describe('DataDownloadOrderEffects', () => {
  const selectionMock: DataDownloadSelection = {
    type: 'select-polygon',
    drawingRepresentation: {
      id: 'id',
      type: 'Feature',
      source: InternalDrawingLayer.Selection,
      properties: {},
      geometry: {
        type: 'Polygon',
        srs: 2056,
        coordinates: [
          [
            [9, -23],
            [9, -17],
            [11, -17],
            [11, -23],
          ],
        ],
      },
    },
  };

  const orderMock: Order = {
    perimeterType: 'direct',
    email: 'direct email',
    srs: 'lv95',
    geometry: MinimalGeometriesUtils.getMinimalPolygon(2056),
    products: [
      {
        id: 1337,
        formatId: 666,
      },
    ],
  };

  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: DataDownloadOrderEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        DataDownloadOrderEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
      ],
    });
    effects = TestBed.inject(DataDownloadOrderEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('zoomToSelection$', () => {
    it('zooms to the geometry extent using the map service, no further action dispatch', (done: DoneFn) => {
      const expectedSelection = selectionMock;
      const configService = TestBed.inject(ConfigService);
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = spyOn(mapService, 'zoomToExtent').and.callThrough();
      store.overrideSelector(selectSelection, expectedSelection);

      const expectedAction = MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'});
      actions$ = of(expectedAction);
      effects.zoomToSelection$.subscribe(([action, _]) => {
        expect(mapServiceSpy).toHaveBeenCalledOnceWith(
          expectedSelection.drawingRepresentation.geometry,
          configService.mapAnimationConfig.zoom.expandFactor,
          configService.mapAnimationConfig.zoom.duration,
        );
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('openDataDownloadDrawerAfterSettingOrder$', () => {
    it('dispatches MapUiActions.showMapSideDrawerContent()', (done: DoneFn) => {
      actions$ = of(DataDownloadOrderActions.setOrder({order: orderMock}));
      effects.openDataDownloadDrawerAfterSettingOrder$.subscribe((action) => {
        expect(action).toEqual(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'}));
        done();
      });
    });
  });

  describe('deactivateToolAfterClearingSelection$', () => {
    it('dispatches ToolActions.deactivateTool() if the currently active tool is not undefined', (done: DoneFn) => {
      store.overrideSelector(selectActiveTool, 'select-polygon');

      actions$ = of(DataDownloadOrderActions.clearSelection());
      effects.deactivateToolAfterClearingSelection$.subscribe((action) => {
        expect(action).toEqual(ToolActions.deactivateTool());
        done();
      });
    });

    it('does not dispatch an action if the currently active tool is undefined', fakeAsync(() => {
      store.overrideSelector(selectActiveTool, undefined);

      let actualAction;
      actions$ = of(DataDownloadOrderActions.clearSelection());
      effects.deactivateToolAfterClearingSelection$.subscribe((action) => (actualAction = action));
      tick();

      expect(actualAction).toBeUndefined();
    }));
  });

  describe('clearSelectionAfterClosingDataDownloadDrawer$', () => {
    it('dispatches DataDownloadActions.clearSelection()', (done: DoneFn) => {
      actions$ = of(MapUiActions.hideMapSideDrawerContent());
      effects.clearSelectionAfterClosingDataDownloadDrawer$.subscribe((action) => {
        expect(action).toEqual(DataDownloadOrderActions.clearSelection());
        done();
      });
    });
  });

  describe('clearGeometryFromMap$', () => {
    it('removes the selection graphics using the map service, no further action dispatch', (done: DoneFn) => {
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'clearDataDownloadSelection').and.callThrough();

      const expectedAction = DataDownloadOrderActions.clearSelection();
      actions$ = of(expectedAction);
      effects.clearGeometryFromMap$.subscribe((action) => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
