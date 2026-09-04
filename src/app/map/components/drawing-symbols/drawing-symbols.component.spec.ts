import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, computed, input, model, signal} from '@angular/core';
import {inputBinding} from '@angular/core';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {SymbolStyleConstants} from 'src/app/shared/constants/symbol-style.constants';
import {DrawingSymbolsComponent} from './drawing-symbols.component';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection/drawing-symbols-collection.component';
import {ExpandableListItemComponent} from 'src/app/shared/components/expandable-list-item/expandable-list-item.component';
import {SliderEditComponent} from '../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';

@Component({
  selector: 'drawing-symbols-collection',
  template: '<div [attr.data-collectionid]="collectionId()" [attr.data-groupname]="groupName()"></div>',
})
class MockDrawingSymbolsCollectionComponent {
  public readonly collectionId = input.required<string>();
  public readonly groupName = input('');
  public readonly value = model<DrawingSymbolDefinition | null>(null);
}

@Component({
  selector: 'expandable-list-item',
  template: '<div [attr.data-header]="header()"><ng-content /></div>',
})
class MockExpandableListItemComponent {
  public readonly header = input('');
  public readonly stickyHeader = input(false);
  public readonly noPadding = input(false);
  public readonly renderContentEagerly = input(false);
  public readonly expanded = input(false);

  public readonly stickyHeaderString = computed(() => (this.stickyHeader() ? 'true' : 'false'));
}

@Component({
  selector: 'slider-edit',
  template: '<div [attr.data-title]="title()"></div>',
})
class MockSliderEditComponent {
  public readonly value = model<number>(0);
  public readonly minValue = input(0);
  public readonly maxValue = input(100);
  public readonly step = input(1);
  public readonly title = input('');
}

describe('DrawingSymbolsComponent', () => {
  let component: DrawingSymbolsComponent;
  let fixture: ComponentFixture<DrawingSymbolsComponent>;
  let compiled: HTMLElement;

  const drawingSymbolsServiceMock: Partial<DrawingSymbolsService> = {
    getCollectionInfos: vi.fn(),
  };

  const groupName = signal('');
  const fullHeight = signal(false);

  const collectionInfos = {
    basic: {
      label: 'Basic symbols',
      url: 'https://example.com/symbols/basic',
    },
    transport: {
      label: 'Transport symbols',
      url: 'https://example.com/symbols/transport',
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.mocked(drawingSymbolsServiceMock.getCollectionInfos!).mockReturnValue(collectionInfos);

    groupName.set('');
    fullHeight.set(false);

    await TestBed.configureTestingModule({
      imports: [DrawingSymbolsComponent],
      providers: [
        {
          provide: DRAWING_SYMBOLS_SERVICE,
          useValue: drawingSymbolsServiceMock,
        },
      ],
    })
      .overrideComponent(DrawingSymbolsComponent, {
        remove: {
          imports: [DrawingSymbolsCollectionComponent, ExpandableListItemComponent, SliderEditComponent],
        },
        add: {
          imports: [MockDrawingSymbolsCollectionComponent, MockExpandableListItemComponent, MockSliderEditComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DrawingSymbolsComponent, {
      bindings: [inputBinding('groupName', groupName), inputBinding('fullHeight', fullHeight)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    it('should use the default group name', () => {
      expect(component.groupName()).toBe('');
    });

    it('should use the default full height value', () => {
      expect(component.fullHeight()).toBe(false);
    });

    it('should accept a group name', () => {
      groupName.set('my-group');
      fixture.detectChanges();

      expect(component.groupName()).toBe('my-group');
    });

    it('should accept the full height input', () => {
      fullHeight.set(true);
      fixture.detectChanges();

      expect(component.fullHeight()).toBe(true);
    });
  });

  describe('models', () => {
    it('should use the default symbol size', () => {
      expect(component.size()).toBe(SymbolStyleConstants.DEFAULT_SYMBOL_SIZE);
    });

    it('should use the default rotation', () => {
      expect(component.rotation()).toBe(0);
    });

    it('should use null as the default symbol', () => {
      expect(component.symbol()).toBeNull();
    });

    it('should update the symbol model', () => {
      const symbol: DrawingSymbolDefinition = {
        type: 'basic',
        size: 0,
        rotation: 0,
        fetchDrawingSymbolDescriptor: vi.fn(),
        toJSON: vi.fn(),
        belongsToCollection: vi.fn(),
      };

      component.symbol.set(symbol);

      expect(component.symbol()).toBe(symbol);
    });

    it('should update the size model', () => {
      component.size.set(25);

      expect(component.size()).toBe(25);
    });

    it('should update the rotation model', () => {
      component.rotation.set(180);

      expect(component.rotation()).toBe(180);
    });
  });

  describe('collections', () => {
    it('should get collection information from the service', () => {
      expect(drawingSymbolsServiceMock.getCollectionInfos).toHaveBeenCalled();
    });

    it('should return collections with their IDs', () => {
      expect(component.collections).toEqual([
        {
          id: 'basic',
          label: 'Basic symbols',
          url: 'https://example.com/symbols/basic',
        },
        {
          id: 'transport',
          label: 'Transport symbols',
          url: 'https://example.com/symbols/transport',
        },
      ]);
    });

    it('should return an empty collection list when the service returns no collections', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollectionInfos!).mockReturnValue({});

      expect(component.collections).toEqual([]);
    });

    it('should request collection information each time collections is accessed', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollectionInfos!).mockClear();

      void component.collections;
      void component.collections;

      expect(drawingSymbolsServiceMock.getCollectionInfos).toHaveBeenCalledTimes(2);
    });
  });

  describe('template', () => {
    it('should render the size slider', () => {
      const slider = compiled.querySelector('slider-edit [data-title="Size"]');

      expect(slider).toBeTruthy();
    });

    it('should render the rotation slider', () => {
      const slider = compiled.querySelector('slider-edit [data-title="Rotation"]');

      expect(slider).toBeTruthy();
    });

    it('should render both sliders', () => {
      expect(compiled.querySelectorAll('slider-edit')).toHaveLength(2);
    });

    it('should render the symbols list', () => {
      expect(compiled.querySelector('.symbols-list')).toBeTruthy();
    });

    it('should not apply the full-height class by default', () => {
      expect(compiled.querySelector('.symbols-list')?.classList.contains('symbols-list--full-height')).toBe(false);
    });

    it('should apply the full-height class when fullHeight is true', () => {
      fullHeight.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('.symbols-list')?.classList.contains('symbols-list--full-height')).toBe(true);
    });

    it('should render one expandable item for every collection', () => {
      expect(compiled.querySelectorAll('expandable-list-item')).toHaveLength(2);
    });

    it('should pass collection labels to expandable list items', () => {
      const items = compiled.querySelectorAll('expandable-list-item > div');

      expect(items[0].getAttribute('data-header')).toBe('Basic symbols');
      expect(items[1].getAttribute('data-header')).toBe('Transport symbols');
    });

    it('should render one symbol collection for every collection', () => {
      expect(compiled.querySelectorAll('drawing-symbols-collection')).toHaveLength(2);
    });

    it('should pass collection IDs to symbol collections', () => {
      const collections = compiled.querySelectorAll('drawing-symbols-collection div');

      expect(collections[0].getAttribute('data-collectionid')).toBe('basic');
      expect(collections[1].getAttribute('data-collectionid')).toBe('transport');
    });

    it('should pass the group name to symbol collections', () => {
      groupName.set('test-group');
      fixture.detectChanges();

      const collections = compiled.querySelectorAll('drawing-symbols-collection div');

      expect(collections[0].getAttribute('data-groupname')).toBe('test-group');
      expect(collections[1].getAttribute('data-groupname')).toBe('test-group');
    });

    it('should render no expandable items when there are no collections', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollectionInfos!).mockReturnValue({});

      fixture.detectChanges();

      expect(compiled.querySelectorAll('expandable-list-item')).toHaveLength(0);
    });

    it('should render no symbol collections when there are no collections', () => {
      vi.mocked(drawingSymbolsServiceMock.getCollectionInfos!).mockReturnValue({});

      fixture.detectChanges();

      expect(compiled.querySelectorAll('drawing-symbols-collection')).toHaveLength(0);
    });
  });
});
