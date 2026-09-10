import {ComponentFixture, DeferBlockBehavior, DeferBlockState, TestBed} from '@angular/core/testing';
import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {of} from 'rxjs';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolChoice} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection.component';

describe('DrawingSymbolsCollectionComponent', () => {
  let component: DrawingSymbolsCollectionComponent;
  let fixture: ComponentFixture<DrawingSymbolsCollectionComponent>;
  let compiled: HTMLElement;

  const drawingSymbolsServiceMock: Partial<DrawingSymbolsService> = {
    getCollection: vi.fn(),
    isSameSymbol: vi.fn(),
  };

  const collectionId = signal('test-collection');
  const groupName = signal('');
  const value = signal<DrawingSymbolDefinition | null>(null);

  const firstSymbolItem: DrawingSymbolDefinition = {
    type: 'first',
    size: 0,
    rotation: 0,
    fetchDrawingSymbolDescriptor: vi.fn(),
    toJSON: vi.fn(),
    belongsToCollection: vi.fn(),
  };

  const secondSymbolItem: DrawingSymbolDefinition = {
    type: 'second',
    size: 0,
    rotation: 0,
    fetchDrawingSymbolDescriptor: vi.fn(),
    toJSON: vi.fn(),
    belongsToCollection: vi.fn(),
  };

  const firstSymbol: DrawingSymbolChoice = {
    name: 'First symbol',
    thumbnail: 'first-thumbnail.png',
    item: firstSymbolItem,
  };

  const secondSymbol: DrawingSymbolChoice = {
    name: 'Second symbol',
    thumbnail: 'second-thumbnail.png',
    item: secondSymbolItem,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(drawingSymbolsServiceMock.getCollection!).mockReturnValue(of([firstSymbol, secondSymbol]));
    vi.mocked(drawingSymbolsServiceMock.isSameSymbol!).mockReturnValue(false);

    collectionId.set('test-collection');
    groupName.set('');

    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [DrawingSymbolsCollectionComponent],
      providers: [
        {
          provide: DRAWING_SYMBOLS_SERVICE,
          useValue: drawingSymbolsServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawingSymbolsCollectionComponent, {
      bindings: [inputBinding('collectionId', collectionId), inputBinding('groupName', groupName), twoWayBinding('value', value)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should expose the collection ID', () => {
      expect(component.collectionId()).toBe('test-collection');
    });

    it('should use an empty group name by default', () => {
      expect(component.groupName()).toBe('');
    });

    it('should update the collection ID when the input changes', () => {
      collectionId.set('other-collection');
      fixture.detectChanges();

      expect(component.collectionId()).toBe('other-collection');
    });

    it('should update the group name when the input changes', () => {
      groupName.set('symbol-group');
      fixture.detectChanges();

      expect(component.groupName()).toBe('symbol-group');
    });
  });

  describe('loading collection items', () => {
    it('should request the collection using the collection ID', () => {
      expect(drawingSymbolsServiceMock.getCollection).toHaveBeenCalledWith('test-collection');
    });

    it('should populate items from the collection observable', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollection!).mockReturnValue(of([firstSymbol]));

      component.items.set([]);

      collectionId.set('reloaded-collection');
      fixture.detectChanges();

      expect(drawingSymbolsServiceMock.getCollection).toHaveBeenCalledWith('reloaded-collection');
    });

    it('should update the items when the collection ID changes', () => {
      const secondCollection = [secondSymbol];

      vi.mocked(drawingSymbolsServiceMock.getCollection!)
        .mockReturnValueOnce(of([firstSymbol]))
        .mockReturnValueOnce(of(secondCollection));

      collectionId.set('first-collection');
      fixture.detectChanges();

      collectionId.set('second-collection');
      fixture.detectChanges();

      expect(drawingSymbolsServiceMock.getCollection).toHaveBeenCalledWith('second-collection');
    });
  });

  describe('statefulItems', () => {
    beforeEach(() => {
      component.items.set([firstSymbol, secondSymbol]);
    });

    it('should mark all symbols as unselected when no value is selected', () => {
      value.set(null);
      fixture.detectChanges();

      expect(component.statefulItems()).toEqual([
        {
          symbol: firstSymbol,
          isSelected: false,
        },
        {
          symbol: secondSymbol,
          isSelected: false,
        },
      ]);

      expect(drawingSymbolsServiceMock.isSameSymbol).not.toHaveBeenCalled();
    });

    it('should use isSameSymbol to determine whether a symbol is selected', () => {
      vi.mocked(drawingSymbolsServiceMock.isSameSymbol!).mockReturnValueOnce(true).mockReturnValueOnce(false);
      fixture.detectChanges();

      value.set(firstSymbolItem);
      fixture.detectChanges();

      expect(component.statefulItems()).toEqual([
        {
          symbol: firstSymbol,
          isSelected: true,
        },
        {
          symbol: secondSymbol,
          isSelected: false,
        },
      ]);

      expect(drawingSymbolsServiceMock.isSameSymbol).toHaveBeenNthCalledWith(1, firstSymbol.item, firstSymbolItem);
      expect(drawingSymbolsServiceMock.isSameSymbol).toHaveBeenNthCalledWith(2, secondSymbol.item, firstSymbolItem);
    });

    it('should recompute selection when the value changes', () => {
      value.set(firstSymbolItem);
      fixture.detectChanges();

      expect(component.statefulItems().every((item) => !item.isSelected)).toBe(true);

      vi.mocked(drawingSymbolsServiceMock.isSameSymbol!)
        .mockReset()
        .mockImplementation((symbol) => symbol === secondSymbol.item);

      value.set(secondSymbolItem);
      fixture.detectChanges();

      expect(component.statefulItems()).toEqual([
        {
          symbol: firstSymbol,
          isSelected: false,
        },
        {
          symbol: secondSymbol,
          isSelected: true,
        },
      ]);
    });

    it('should return an empty array when there are no items', () => {
      component.items.set([]);

      expect(component.statefulItems()).toEqual([]);
    });
  });

  describe('template', () => {
    beforeEach(() => {
      vi.mocked(drawingSymbolsServiceMock.getCollection!).mockReturnValue(of([firstSymbol, secondSymbol]));
      fixture.detectChanges();
    });

    it('should render one item for every symbol', () => {
      const items = compiled.querySelectorAll('.drawing-symbols-collection__grid__item');

      expect(items).toHaveLength(2);
    });

    it('should render the symbol names', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollection!).mockReturnValue(of([firstSymbol, secondSymbol]));

      fixture.detectChanges();

      const names = compiled.querySelectorAll('.drawing-symbols-collection__grid__item span.sr-only');

      expect(names[0].textContent?.trim()).toBe('First symbol');
      expect(names[1].textContent?.trim()).toBe('Second symbol');
    });

    it('should render the radio inputs', () => {
      const inputs = compiled.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      expect(inputs).toHaveLength(2);
      expect(inputs[0].id).toBe('First symbol');
      expect(inputs[1].id).toBe('Second symbol');
    });

    it('should use the symbol group name for all radio inputs', () => {
      groupName.set('my-symbol-group');
      fixture.detectChanges();

      const inputs = compiled.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      expect(inputs[0].name).toBe('my-symbol-group');
      expect(inputs[1].name).toBe('my-symbol-group');
    });

    it('should render the symbol images', async () => {
      vi.mocked(drawingSymbolsServiceMock.getCollection!).mockReturnValue(of([firstSymbol, secondSymbol]));
      fixture.detectChanges();

      const deferBlocks = await fixture.getDeferBlocks();

      await Promise.all(deferBlocks.map((b) => b.render(DeferBlockState.Complete)));

      const images = compiled.querySelectorAll<HTMLImageElement>('.drawing-symbols-collection__grid__thumbnail');

      expect(images).toHaveLength(2);
      expect(images[0].src).toContain('first-thumbnail.png');
      expect(images[0].alt).toBe('First symbol');
      expect(images[0].title).toBe('First symbol');
      expect(images[0].width).toBe(64);
      expect(images[0].height).toBe(64);

      expect(images[1].src).toContain('second-thumbnail.png');
      expect(images[1].alt).toBe('Second symbol');
      expect(images[1].title).toBe('Second symbol');
    });

    it('should mark the selected symbol as checked', () => {
      vi.mocked(drawingSymbolsServiceMock.isSameSymbol!).mockReturnValueOnce(true).mockReturnValueOnce(false);

      value.set(firstSymbolItem);
      fixture.detectChanges();

      const inputs = compiled.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);
    });

    it('should update the value when a symbol is selected', () => {
      const inputs = compiled.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      inputs[1].dispatchEvent(new Event('change'));

      expect(component.value()).toBe(secondSymbol.item);
    });

    it('should render no items when the collection is empty', () => {
      component.items.set([]);
      fixture.detectChanges();

      expect(compiled.querySelectorAll('.drawing-symbols-collection__grid__item')).toHaveLength(0);
    });
  });
});
