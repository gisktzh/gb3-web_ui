import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {DRAWING_SYMBOLS_SERVICE} from '../../../../app.tokens';
import {UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {DrawingSymbolDefinition} from '../../../../shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
  Gb3SymbolStyle,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingSymbolsService} from '../../../../shared/interfaces/drawing-symbols-service.interface';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {selectSelectedDrawing} from '../../../../state/map/reducers/drawing.reducer';
import {AbstractEsriDrawableToolStrategy} from '../../../services/esri-services/tool-service/strategies/abstract-esri-drawable-tool.strategy';
import {DrawingEditComponent} from './drawing-edit.component';

const pointStyle: Gb3StyleRepresentation = {
  type: 'point',
  strokeWidth: 2,
  strokeOpacity: 1,
  strokeColor: '#000000',
  fillOpacity: 1,
  fillColor: '#ffffff',
  pointRadius: 8,
};

const selectedDrawing: Gb3StyledInternalDrawingRepresentation = {
  type: 'Feature',
  source: UserDrawingLayer.Drawings,
  geometry: {type: 'Point', coordinates: [0, 0], srs: 2056},
  properties: {
    style: pointStyle,
    [AbstractEsriDrawableToolStrategy.identifierFieldName]: 'drawing-1',
    [AbstractEsriDrawableToolStrategy.toolFieldName]: 'point',
  },
};

describe('DrawingEditComponent', () => {
  let fixture: ComponentFixture<DrawingEditComponent>;
  let store: MockStore;
  const symbolsService: Partial<DrawingSymbolsService> = {
    convertToMapDrawingSymbol: vi.fn(),
    getCollectionInfos: vi.fn(() => ({})),
    getCollection: vi.fn(() => of([])),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingEditComponent],
      providers: [provideMockStore(), {provide: DRAWING_SYMBOLS_SERVICE, useValue: symbolsService}],
    }).compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectSelectedDrawing, selectedDrawing);
    fixture = TestBed.createComponent(DrawingEditComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it.each([
    ['point', 'point-edit'],
    ['line', 'line-edit'],
    ['polygon', 'polygon-edit'],
    ['text', 'text-edit'],
    ['symbol', 'symbol-edit'],
  ] as const)('renders the editor matching a %s style', (type, selector) => {
    const styles = {
      point: pointStyle,
      line: {type: 'line', strokeWidth: 1, strokeOpacity: 1, strokeColor: '#000000'},
      polygon: {...pointStyle, type: 'polygon'},
      text: {
        type: 'text',
        fontSize: '12',
        fontColor: '#000000',
        fontFamily: 'Arial',
        labelYOffset: '0',
        labelAlign: 'center',
        haloColor: '#ffffff',
        haloRadius: '1',
        label: '',
      },
      symbol: {type: 'symbol', symbolSize: 24, symbolRotation: 0, symbolDefinition: null},
    } as const;

    fixture.componentInstance.style.set(styles[type] as Gb3StyleRepresentation);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(selector)).not.toBeNull();
  });

  it('dispatches a changed non-symbol style for the selected drawing', async () => {
    const dispatch = vi.spyOn(store, 'dispatch');

    await fixture.componentInstance.updateStyle(pointStyle, 'label');

    expect(dispatch).toHaveBeenCalledWith(
      DrawingActions.updateDrawingStyles({style: pointStyle, drawing: selectedDrawing, labelText: 'label'}),
    );
  });

  it('converts a selected symbol before dispatching its style', async () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const definition = {
      type: 'cim',
      size: 1,
      rotation: 0,
      fetchDrawingSymbolDescriptor: vi.fn(),
      toJSON: vi.fn(),
      belongsToCollection: vi.fn(),
    } satisfies DrawingSymbolDefinition;
    const style: Gb3SymbolStyle = {type: 'symbol', symbolSize: 32, symbolRotation: 45, symbolDefinition: definition};
    const mapDrawingSymbol = {drawingSymbolDefinition: definition};
    vi.mocked(symbolsService.convertToMapDrawingSymbol!).mockResolvedValue(mapDrawingSymbol);

    await fixture.componentInstance.updateStyle(style, undefined, definition);

    expect(symbolsService.convertToMapDrawingSymbol).toHaveBeenCalledWith(definition, 32, 45);
    expect(dispatch).toHaveBeenCalledWith(
      DrawingActions.updateDrawingStyles({style, drawing: selectedDrawing, labelText: undefined, mapDrawingSymbol}),
    );
  });
});
