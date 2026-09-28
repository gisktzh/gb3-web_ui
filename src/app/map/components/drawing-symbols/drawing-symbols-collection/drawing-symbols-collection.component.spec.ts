import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, DeferBlockBehavior, TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {DRAWING_SYMBOLS_SERVICE} from '../../../../app.tokens';
import {DrawingSymbolChoice} from '../../../../shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {DrawingSymbolDefinition} from '../../../../shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolsService} from '../../../../shared/interfaces/drawing-symbols-service.interface';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection.component';

const firstDefinition = {
  type: 'first',
  size: 1,
  rotation: 0,
  fetchDrawingSymbolDescriptor: vi.fn(),
  toJSON: vi.fn(),
  belongsToCollection: vi.fn(),
} satisfies DrawingSymbolDefinition;
const secondDefinition = {...firstDefinition, type: 'second'} satisfies DrawingSymbolDefinition;
const choices: DrawingSymbolChoice[] = [
  {name: 'First symbol', thumbnail: '/first.png', item: firstDefinition},
  {name: 'Second symbol', thumbnail: '/second.png', item: secondDefinition},
];

describe('DrawingSymbolsCollectionComponent', () => {
  let fixture: ComponentFixture<DrawingSymbolsCollectionComponent>;
  const selected = signal<DrawingSymbolDefinition | null>(null);
  const service: Partial<DrawingSymbolsService> = {
    getCollection: vi.fn(() => of(choices)),
    isSameSymbol: vi.fn((left, right) => left.type === right.type),
  };

  beforeEach(async () => {
    selected.set(null);
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [DrawingSymbolsCollectionComponent],
      providers: [{provide: DRAWING_SYMBOLS_SERVICE, useValue: service}],
    }).compileComponents();
    fixture = TestBed.createComponent(DrawingSymbolsCollectionComponent, {
      bindings: [twoWayBinding('value', selected), inputBinding('collectionId', () => 'basic'), inputBinding('groupName', () => 'symbols')],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('loads and renders the requested collection', () => {
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    expect(service.getCollection).toHaveBeenCalledWith('basic');
    expect(radios).toHaveLength(2);
    expect([...radios].map((radio) => [radio.id, radio.name])).toEqual([
      ['First symbol', 'symbols'],
      ['Second symbol', 'symbols'],
    ]);
  });

  it('marks the matching symbol as selected', () => {
    selected.set(secondDefinition);
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;

    expect(radios[0].checked).toBe(false);
    expect(radios[1].checked).toBe(true);
  });

  it('publishes a symbol selected by the user', () => {
    const radios = fixture.nativeElement.querySelectorAll('input[type="radio"]') as NodeListOf<HTMLInputElement>;
    radios[1].dispatchEvent(new Event('change'));

    expect(selected()).toBe(secondDefinition);
  });
});
