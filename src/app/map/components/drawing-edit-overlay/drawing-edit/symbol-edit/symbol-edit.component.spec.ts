import {Component, input, model, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SymbolEditComponent} from './symbol-edit.component';
import {DrawingSymbolsComponent} from '../../../drawing-symbols/drawing-symbols.component';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {Gb3SymbolStyle} from './../../../../../shared/interfaces/internal-drawing-representation.interface';

@Component({
  selector: 'drawing-symbols',
  template: '',
})
class MockDrawingSymbolsComponent {
  public readonly groupName = input<string>();
  public readonly size = model<number>();
  public readonly rotation = model<number>();
  public readonly symbol = model<DrawingSymbolDefinition | null>();
  public readonly fullHeight = input<boolean>();
}

describe('SymbolEditComponent', () => {
  let component: SymbolEditComponent;
  let fixture: ComponentFixture<SymbolEditComponent>;
  let compiled: HTMLElement;

  const selectedSymbol: DrawingSymbolDefinition = {
    type: '',
    size: 0,
    rotation: 0,
    fetchDrawingSymbolDescriptor: vi.fn(),
    toJSON: vi.fn(),
    belongsToCollection: vi.fn(),
  };

  const symbolStyle = signal<{
    style: Gb3SymbolStyle;
    selectedSymbol: DrawingSymbolDefinition | null;
  }>({
    style: {
      symbolSize: 24,
      symbolRotation: 15,
      type: 'symbol',
      symbolDefinition: undefined,
    },
    selectedSymbol,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolEditComponent],
    })
      .overrideComponent(SymbolEditComponent, {
        remove: {
          imports: [DrawingSymbolsComponent],
        },
        add: {
          imports: [MockDrawingSymbolsComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SymbolEditComponent, {
      bindings: [twoWayBinding('symbolStyle', symbolStyle)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the drawing symbols component', () => {
    expect(compiled.querySelector('drawing-symbols')).toBeTruthy();
  });

  it('should configure the drawing symbols component', () => {
    const drawingSymbols = fixture.debugElement.children[0].componentInstance as MockDrawingSymbolsComponent;

    expect(drawingSymbols.groupName()).toBe('symbols');
    expect(drawingSymbols.size()).toBe(24);
    expect(drawingSymbols.rotation()).toBe(15);
    expect(drawingSymbols.symbol()).toBe(selectedSymbol);
    expect(drawingSymbols.fullHeight()).toBe(true);
  });

  it('should apply default style values to a partially defined style', () => {
    symbolStyle.set({
      style: {
        symbolSize: 42,
      } as Gb3SymbolStyle,
      selectedSymbol,
    });

    fixture.detectChanges();

    expect(component.symbolStyleFormModel()).toEqual({
      selectedSymbol,
      style: {
        symbolSize: 42,
        symbolRotation: 0,
      },
    });
  });

  it('should preserve supplied style values when the external symbol style changes', () => {
    const newSymbol: DrawingSymbolDefinition = {
      type: '',
      size: 35,
      rotation: 90,
      fetchDrawingSymbolDescriptor: vi.fn(),
      toJSON: vi.fn(),
      belongsToCollection: vi.fn(),
    };

    symbolStyle.set({
      style: {
        symbolSize: 35,
        symbolRotation: 90,
        type: 'symbol',
        symbolDefinition: newSymbol,
      },
      selectedSymbol: newSymbol,
    });

    fixture.detectChanges();

    expect(component.symbolStyleFormModel()).toEqual({
      selectedSymbol: newSymbol,
      style: {
        symbolSize: 35,
        symbolRotation: 90,
        type: 'symbol',
        symbolDefinition: newSymbol,
      },
    });
  });

  it('should update the externally bound symbol style when the symbol size changes', async () => {
    const drawingSymbols = fixture.debugElement.children[0].componentInstance as MockDrawingSymbolsComponent;

    drawingSymbols.size.set(45);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(symbolStyle().style.symbolSize).toBe(45);
  });

  it('should update the externally bound symbol style when the rotation changes', async () => {
    const drawingSymbols = fixture.debugElement.children[0].componentInstance as MockDrawingSymbolsComponent;

    drawingSymbols.rotation.set(120);
    fixture.detectChanges();

    await fixture.whenStable();

    expect(symbolStyle().style.symbolRotation).toBe(120);
  });

  it('should update the drawing symbols component when the external style changes', () => {
    const newSymbol: DrawingSymbolDefinition = {
      type: '',
      size: 50,
      rotation: 180,
      fetchDrawingSymbolDescriptor: vi.fn(),
      toJSON: vi.fn(),
      belongsToCollection: vi.fn(),
    };

    symbolStyle.set({
      style: {
        symbolSize: 50,
        symbolRotation: 180,
        type: 'symbol',
        symbolDefinition: newSymbol,
      },
      selectedSymbol: newSymbol,
    });

    fixture.detectChanges();

    const drawingSymbols = fixture.debugElement.children[0].componentInstance as MockDrawingSymbolsComponent;

    expect(drawingSymbols.size()).toBe(50);
    expect(drawingSymbols.rotation()).toBe(180);
    expect(drawingSymbols.symbol()).toBe(newSymbol);
  });
});
