import {Component, input, model, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DrawingSymbolDefinition} from '../../../../../shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {Gb3SymbolStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingSymbolsComponent} from '../../../drawing-symbols/drawing-symbols.component';
import {SymbolEditComponent} from './symbol-edit.component';

@Component({selector: 'drawing-symbols', template: ''})
class DrawingSymbolsStubComponent {
  public readonly groupName = input('');
  public readonly size = model(0);
  public readonly rotation = model(0);
  public readonly symbol = model<DrawingSymbolDefinition | null>(null);
  public readonly fullHeight = input(false);
}

const symbol: DrawingSymbolDefinition = {
  type: 'cim',
  size: 24,
  rotation: 0,
  fetchDrawingSymbolDescriptor: vi.fn(),
  toJSON: vi.fn(),
  belongsToCollection: vi.fn(),
};

describe('SymbolEditComponent', () => {
  let fixture: ComponentFixture<SymbolEditComponent>;
  const symbolStyle = signal<{style: Gb3SymbolStyle; selectedSymbol: DrawingSymbolDefinition | null}>({
    style: {type: 'symbol', symbolSize: 24, symbolRotation: 15, symbolDefinition: symbol},
    selectedSymbol: symbol,
  });

  beforeEach(async () => {
    symbolStyle.set({
      style: {type: 'symbol', symbolSize: 24, symbolRotation: 15, symbolDefinition: symbol},
      selectedSymbol: symbol,
    });
    await TestBed.configureTestingModule({imports: [SymbolEditComponent]})
      .overrideComponent(SymbolEditComponent, {
        remove: {imports: [DrawingSymbolsComponent]},
        add: {imports: [DrawingSymbolsStubComponent]},
      })
      .compileComponents();
    fixture = TestBed.createComponent(SymbolEditComponent, {bindings: [twoWayBinding('symbolStyle', symbolStyle)]});
    fixture.detectChanges();
  });

  it('passes the selected symbol style to the picker', () => {
    const picker = fixture.debugElement.children[0].componentInstance as DrawingSymbolsStubComponent;

    expect(picker.groupName()).toBe('symbols');
    expect(picker.size()).toBe(24);
    expect(picker.rotation()).toBe(15);
    expect(picker.symbol()).toBe(symbol);
    expect(picker.fullHeight()).toBe(true);
  });

  it('publishes picker changes through the style binding', async () => {
    const picker = fixture.debugElement.children[0].componentInstance as DrawingSymbolsStubComponent;
    picker.size.set(40);
    picker.rotation.set(90);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    expect(symbolStyle().style.symbolSize).toBe(40);
    expect(symbolStyle().style.symbolRotation).toBe(90);
  });
});
