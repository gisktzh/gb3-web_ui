import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectSelectedDrawing} from '../../../../state/map/reducers/drawing.reducer';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingEditComponent} from './drawing-edit.component';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
  Gb3SymbolStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {AbstractEsriDrawableToolStrategy} from 'src/app/map/services/esri-services/tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {of} from 'rxjs';

describe('DrawingEditComponent', () => {
  let component: DrawingEditComponent;
  let fixture: ComponentFixture<DrawingEditComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const drawingSymbolsServiceMock: Partial<DrawingSymbolsService> = {
    convertToMapDrawingSymbol: vi.fn(),
    getCollectionInfos: vi.fn(() => ({a: {label: 'asdf', url: 'https://www.example.com'}})),
    getCollection: vi.fn(() => of([])),
  };

  const pointStyle = {
    type: 'point',
  } as Gb3StyleRepresentation;

  const lineStyle = {
    type: 'line',
  } as Gb3StyleRepresentation;

  const polygonStyle = {
    type: 'polygon',
  } as Gb3StyleRepresentation;

  const textStyle = {
    type: 'text',
  } as Gb3StyleRepresentation;

  const symbolStyle: Gb3SymbolStyle = {
    type: 'symbol',
    symbolSize: 20,
    symbolRotation: 45,
    symbolDefinition: {
      type: '',
      size: 0,
      rotation: 0,
      fetchDrawingSymbolDescriptor: vi.fn(),
      toJSON: vi.fn(),
      belongsToCollection: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DrawingEditComponent],
      providers: [{provide: DRAWING_SYMBOLS_SERVICE, useValue: drawingSymbolsServiceMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectSelectedDrawing, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DrawingEditComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('style', () => {
    it('should initially be undefined when no drawing is selected', () => {
      expect(component.style()).toBeUndefined();
    });

    it('should update when the selected drawing changes', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: pointStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.style()).toBe(pointStyle);
    });
  });

  describe('style type computed values', () => {
    it('should return the point style for a point style', () => {
      component.style.set(pointStyle);

      expect(component.isPointStyle()).toBe(pointStyle);
      expect(component.isLineStyle()).toBeNull();
      expect(component.isPolygonStyle()).toBeNull();
      expect(component.isTextStyle()).toBeNull();
      expect(component.isSymbolStyle()).toBeNull();
    });

    it('should return the line style for a line style', () => {
      component.style.set(lineStyle);

      expect(component.isPointStyle()).toBeNull();
      expect(component.isLineStyle()).toBe(lineStyle);
      expect(component.isPolygonStyle()).toBeNull();
      expect(component.isTextStyle()).toBeNull();
      expect(component.isSymbolStyle()).toBeNull();
    });

    it('should return the polygon style for a polygon style', () => {
      component.style.set(polygonStyle);

      expect(component.isPointStyle()).toBeNull();
      expect(component.isLineStyle()).toBeNull();
      expect(component.isPolygonStyle()).toBe(polygonStyle);
      expect(component.isTextStyle()).toBeNull();
      expect(component.isSymbolStyle()).toBeNull();
    });

    it('should return the text style for a text style', () => {
      component.style.set(textStyle);

      expect(component.isPointStyle()).toBeNull();
      expect(component.isLineStyle()).toBeNull();
      expect(component.isPolygonStyle()).toBeNull();
      expect(component.isTextStyle()).toBe(textStyle);
      expect(component.isSymbolStyle()).toBeNull();
    });

    it('should return the symbol style for a symbol style', () => {
      component.style.set(symbolStyle);

      expect(component.isPointStyle()).toBeNull();
      expect(component.isLineStyle()).toBeNull();
      expect(component.isPolygonStyle()).toBeNull();
      expect(component.isTextStyle()).toBeNull();
      expect(component.isSymbolStyle()).toBe(symbolStyle);
    });

    it('should return null for every style type when there is no style', () => {
      component.style.set(undefined);

      expect(component.isPointStyle()).toBeNull();
      expect(component.isLineStyle()).toBeNull();
      expect(component.isPolygonStyle()).toBeNull();
      expect(component.isTextStyle()).toBeNull();
      expect(component.isSymbolStyle()).toBeNull();
    });
  });

  describe('template', () => {
    it('should render nothing when there is no style', () => {
      expect(compiled.querySelector('point-edit')).toBeNull();
      expect(compiled.querySelector('line-edit')).toBeNull();
      expect(compiled.querySelector('polygon-edit')).toBeNull();
      expect(compiled.querySelector('text-edit')).toBeNull();
      expect(compiled.querySelector('symbol-edit')).toBeNull();
    });

    it('should render point-edit for a point style', () => {
      component.style.set(pointStyle);
      fixture.detectChanges();

      expect(compiled.querySelector('point-edit')).toBeTruthy();
      expect(compiled.querySelector('line-edit')).toBeNull();
      expect(compiled.querySelector('polygon-edit')).toBeNull();
      expect(compiled.querySelector('text-edit')).toBeNull();
      expect(compiled.querySelector('symbol-edit')).toBeNull();
    });

    it('should render line-edit for a line style', () => {
      component.style.set(lineStyle);
      fixture.detectChanges();

      expect(compiled.querySelector('point-edit')).toBeNull();
      expect(compiled.querySelector('line-edit')).toBeTruthy();
      expect(compiled.querySelector('polygon-edit')).toBeNull();
      expect(compiled.querySelector('text-edit')).toBeNull();
      expect(compiled.querySelector('symbol-edit')).toBeNull();
    });

    it('should render polygon-edit for a polygon style', () => {
      component.style.set(polygonStyle);
      fixture.detectChanges();

      expect(compiled.querySelector('point-edit')).toBeNull();
      expect(compiled.querySelector('line-edit')).toBeNull();
      expect(compiled.querySelector('polygon-edit')).toBeTruthy();
      expect(compiled.querySelector('text-edit')).toBeNull();
      expect(compiled.querySelector('symbol-edit')).toBeNull();
    });

    it('should render text-edit for a text style', () => {
      component.style.set(textStyle);
      fixture.detectChanges();

      expect(compiled.querySelector('point-edit')).toBeNull();
      expect(compiled.querySelector('line-edit')).toBeNull();
      expect(compiled.querySelector('polygon-edit')).toBeNull();
      expect(compiled.querySelector('text-edit')).toBeTruthy();
      expect(compiled.querySelector('symbol-edit')).toBeNull();
    });

    it('should render symbol-edit for a symbol style', () => {
      component.style.set(symbolStyle);
      fixture.detectChanges();

      expect(compiled.querySelector('point-edit')).toBeNull();
      expect(compiled.querySelector('line-edit')).toBeNull();
      expect(compiled.querySelector('polygon-edit')).toBeNull();
      expect(compiled.querySelector('text-edit')).toBeNull();
      expect(compiled.querySelector('symbol-edit')).toBeTruthy();
    });
  });

  describe('updateStyle', () => {
    it('should do nothing when there is no selected drawing', async () => {
      await component.updateStyle(pointStyle);

      expect(storeDispatchSpy).not.toHaveBeenCalled();
      expect(drawingSymbolsServiceMock.convertToMapDrawingSymbol).not.toHaveBeenCalled();
    });

    it('should dispatch the updated style for a non-symbol style', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: pointStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(pointStyle, 'label');

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: pointStyle,
          drawing: selectedDrawing,
          labelText: 'label',
        }),
      );
    });

    it('should dispatch the updated style without a label when no label is provided', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: lineStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'LineString',
          coordinates: [
            [12, 13],
            [13, 12],
          ],
          srs: 2056,
        },
        type: 'Feature',
      };

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(lineStyle);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: lineStyle,
          drawing: selectedDrawing,
          labelText: undefined,
        }),
      );
    });

    it('should convert a symbol definition before dispatching a symbol style', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: symbolStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };
      const drawingSymbolDefinition: DrawingSymbolDefinition = {
        type: 'cim',
        size: 0,
        rotation: 0,
        fetchDrawingSymbolDescriptor: vi.fn(),
        toJSON: vi.fn(),
        belongsToCollection: vi.fn(),
      };

      const mapDrawingSymbol = {
        drawingSymbolDefinition,
      };

      drawingSymbolsServiceMock.convertToMapDrawingSymbol = vi.fn().mockResolvedValue(mapDrawingSymbol);

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(symbolStyle, undefined, drawingSymbolDefinition);

      expect(drawingSymbolsServiceMock.convertToMapDrawingSymbol).toHaveBeenCalledWith(
        drawingSymbolDefinition,
        symbolStyle.symbolSize,
        symbolStyle.symbolRotation,
      );

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: symbolStyle,
          drawing: selectedDrawing,
          labelText: undefined,
          mapDrawingSymbol,
        }),
      );
    });

    it('should dispatch null when symbol conversion returns undefined', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: symbolStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };
      const drawingSymbolDefinition: DrawingSymbolDefinition = {
        type: 'cim',
        size: 0,
        rotation: 0,
        fetchDrawingSymbolDescriptor: vi.fn(),
        toJSON: vi.fn(),
        belongsToCollection: vi.fn(),
      };

      drawingSymbolsServiceMock.convertToMapDrawingSymbol = vi.fn().mockResolvedValue(undefined);

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(symbolStyle, 'symbol label', drawingSymbolDefinition);

      expect(drawingSymbolsServiceMock.convertToMapDrawingSymbol).toHaveBeenCalledWith(
        drawingSymbolDefinition,
        symbolStyle.symbolSize,
        symbolStyle.symbolRotation,
      );

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: symbolStyle,
          drawing: selectedDrawing,
          labelText: 'symbol label',
          mapDrawingSymbol: null,
        }),
      );
    });

    it('should not convert the symbol definition when the style is not a symbol style', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: pointStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };
      const drawingSymbolDefinition: DrawingSymbolDefinition = {
        type: 'cim',
        size: 0,
        rotation: 0,
        fetchDrawingSymbolDescriptor: vi.fn(),
        toJSON: vi.fn(),
        belongsToCollection: vi.fn(),
      };

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(pointStyle, undefined, drawingSymbolDefinition);

      expect(drawingSymbolsServiceMock.convertToMapDrawingSymbol).not.toHaveBeenCalled();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: pointStyle,
          drawing: selectedDrawing,
          labelText: undefined,
        }),
      );
    });

    it('should not convert the symbol definition when it is null', async () => {
      const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
        properties: {
          style: symbolStyle,
          [AbstractEsriDrawableToolStrategy.identifierFieldName]: '',
          [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
        },
        source: UserDrawingLayer.Drawings,
        geometry: {
          type: 'Point',
          coordinates: [12, 13],
          srs: 2056,
        },
        type: 'Feature',
      };

      store.overrideSelector(selectSelectedDrawing, selectedDrawing);
      store.refreshState();

      fixture.detectChanges();
      await fixture.whenStable();

      await component.updateStyle(symbolStyle, undefined, null);

      expect(drawingSymbolsServiceMock.convertToMapDrawingSymbol).not.toHaveBeenCalled();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        DrawingActions.updateDrawingStyles({
          style: symbolStyle,
          drawing: selectedDrawing,
          labelText: undefined,
        }),
      );
    });
  });

  describe('child component events', () => {
    it('should update the style when point-edit emits a style change', async () => {
      component.style.set(pointStyle);
      fixture.detectChanges();

      const pointEdit = compiled.querySelector('point-edit');

      pointEdit?.dispatchEvent(new CustomEvent('pointStyleChange', {detail: lineStyle}));
      await fixture.whenStable();

      expect(storeDispatchSpy).not.toHaveBeenCalled();
    });

    it('should update the style when line-edit emits a style change', async () => {
      component.style.set(lineStyle);
      fixture.detectChanges();

      const lineEdit = compiled.querySelector('line-edit');

      lineEdit?.dispatchEvent(new CustomEvent('lineStyleChange', {detail: pointStyle}));
      await fixture.whenStable();

      expect(storeDispatchSpy).not.toHaveBeenCalled();
    });
  });
});
