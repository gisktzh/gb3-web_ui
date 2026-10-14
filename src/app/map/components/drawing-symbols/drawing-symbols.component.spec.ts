import {Component, input, model, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DRAWING_SYMBOLS_SERVICE} from '../../../app.tokens';
import {ExpandableListItemComponent} from '../../../shared/components/expandable-list-item/expandable-list-item.component';
import {DrawingSymbolDefinition} from '../../../shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolsService} from '../../../shared/interfaces/drawing-symbols-service.interface';
import {SliderEditComponent} from '../drawing-edit-overlay/drawing-edit/slider-edit/slider-edit.component';
import {DrawingSymbolsCollectionComponent} from './drawing-symbols-collection/drawing-symbols-collection.component';
import {DrawingSymbolsComponent} from './drawing-symbols.component';

@Component({selector: 'slider-edit', template: ''})
class SliderStubComponent {
  public readonly value = model<number>();
  public readonly minValue = input(0);
  public readonly maxValue = input(100);
  public readonly step = input(1);
  public readonly title = input('');
}

@Component({selector: 'expandable-list-item', template: '<ng-content />'})
class ExpandableItemStubComponent {
  public readonly header = input('');
  public readonly stickyHeader = input(false);
  public readonly noPadding = input(false);
  public readonly renderContentEagerly = input(false);
  public readonly expanded = input(false);
}

@Component({selector: 'drawing-symbols-collection', template: ''})
class CollectionStubComponent {
  public readonly collectionId = input.required<string>();
  public readonly groupName = input('');
  public readonly value = model<DrawingSymbolDefinition | null>(null);
}

describe('DrawingSymbolsComponent', () => {
  let fixture: ComponentFixture<DrawingSymbolsComponent>;
  const selected = signal<DrawingSymbolDefinition | null>(null);
  const service: Partial<DrawingSymbolsService> = {
    getCollectionInfos: vi.fn(() => ({
      basic: {label: 'Basic symbols', url: '/basic'},
      transport: {label: 'Transport', url: '/transport'},
    })),
  };

  beforeEach(async () => {
    selected.set(null);
    await TestBed.configureTestingModule({
      imports: [DrawingSymbolsComponent],
      providers: [{provide: DRAWING_SYMBOLS_SERVICE, useValue: service}],
    })
      .overrideComponent(DrawingSymbolsComponent, {
        remove: {imports: [DrawingSymbolsCollectionComponent, ExpandableListItemComponent, SliderEditComponent]},
        add: {imports: [CollectionStubComponent, ExpandableItemStubComponent, SliderStubComponent]},
      })
      .compileComponents();
    fixture = TestBed.createComponent(DrawingSymbolsComponent);
    fixture.componentRef.setInput('groupName', 'drawing-symbols');
    fixture.detectChanges();
  });

  it('renders size and rotation controls', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(SliderStubComponent)).map(({componentInstance}) => componentInstance);

    expect(sliders.map((slider) => slider.title())).toEqual(['Size', 'Rotation']);
    expect(sliders[0].minValue()).toBe(1);
    expect(sliders[0].maxValue()).toBe(50);
    expect(sliders[1].maxValue()).toBe(360);
  });

  it('renders each service collection and forwards the group name', () => {
    const items = fixture.debugElement.queryAll(By.directive(ExpandableItemStubComponent));
    const collections = fixture.debugElement.queryAll(By.directive(CollectionStubComponent));

    expect(items.map(({componentInstance}) => componentInstance.header())).toEqual(['Basic symbols', 'Transport']);
    expect(collections.map(({componentInstance}) => componentInstance.collectionId())).toEqual(['basic', 'transport']);
    expect(collections.every(({componentInstance}) => componentInstance.groupName() === 'drawing-symbols')).toBe(true);
  });

  it('expands the collection containing the selected symbol', () => {
    const symbol = {belongsToCollection: vi.fn((id: string) => id === 'transport')} as unknown as DrawingSymbolDefinition;
    fixture.componentInstance.symbol.set(symbol);
    fixture.detectChanges();
    const items = fixture.debugElement.queryAll(By.directive(ExpandableItemStubComponent));

    expect(items.map(({componentInstance}) => componentInstance.expanded())).toEqual([false, true]);
  });

  it('uses the full-height layout when requested', () => {
    fixture.componentRef.setInput('fullHeight', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.symbols-list').classList).toContain('symbols-list--full-height');
  });
});
