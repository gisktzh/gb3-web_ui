import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectLegendItemsForDisplay} from 'src/app/state/map/selectors/legend-result-display.selector';
import {selectLoadingState} from 'src/app/state/map/reducers/legend.reducer';
import {LegendDisplay} from 'src/app/shared/interfaces/legend.interface';
import {LegendComponent} from './legend.component';
import {provideRouter} from '@angular/router';
import {By} from '@angular/platform-browser';
import {LegendItemComponent} from '../legend-item/legend-item.component';

describe('LegendComponent', () => {
  let component: LegendComponent;
  let fixture: ComponentFixture<LegendComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const showInteractiveElements = signal(true);

  const createLegendItem = (id: string, title: string): LegendDisplay =>
    ({
      id,
      title,
      metaDataLink: `https://example.test/${id}`,
      mapId: 'yes',
      icon: undefined,
      isSingleLayer: true,
      layers: [],
    }) as LegendDisplay;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectLegendItemsForDisplay, []);
    store.overrideSelector(selectLoadingState, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(LegendComponent, {
      bindings: [inputBinding('showInteractiveElements', showInteractiveElements)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the loading and process bar', () => {
    expect(compiled.querySelector('loading-and-process-bar')).not.toBeNull();
  });

  it('should not render legend items while loading', () => {
    store.overrideSelector(selectLoadingState, 'loading');
    store.overrideSelector(selectLegendItemsForDisplay, [createLegendItem('1', 'First legend')]);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('legend-item')).toHaveLength(0);
  });

  it('should not render legend items when loading has an error', () => {
    store.overrideSelector(selectLoadingState, 'error');
    store.overrideSelector(selectLegendItemsForDisplay, [createLegendItem('1', 'First legend')]);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('legend-item')).toHaveLength(0);
  });

  it('should render no legend items when loaded with an empty result', () => {
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectLegendItemsForDisplay, []);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('legend-item')).toHaveLength(0);
  });

  it('should render all legend items when loaded', () => {
    const items = [createLegendItem('1', 'First legend'), createLegendItem('2', 'Second legend'), createLegendItem('3', 'Third legend')];

    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectLegendItemsForDisplay, items);
    store.refreshState();
    fixture.detectChanges();

    const renderedItems = compiled.querySelectorAll('legend-item');

    expect(renderedItems).toHaveLength(3);
  });

  it('should pass each legend item to the corresponding legend item component', () => {
    const items = [createLegendItem('1', 'First legend'), createLegendItem('2', 'Second legend')];

    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectLegendItemsForDisplay, items);
    store.refreshState();
    fixture.detectChanges();

    const renderedItems = Array.from(fixture.debugElement.queryAll(By.directive(LegendItemComponent))).map(
      (i) => i.componentInstance as LegendItemComponent,
    );

    expect(renderedItems).toHaveLength(2);
    expect(renderedItems[0].legendItem()).not.toBeNull();
    expect(renderedItems[1].legendItem()).not.toBeNull();
  });

  it('should pass showInteractiveElements to each legend item', () => {
    const items = [createLegendItem('1', 'First legend'), createLegendItem('2', 'Second legend')];

    showInteractiveElements.set(false);
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectLegendItemsForDisplay, items);
    store.refreshState();
    fixture.detectChanges();

    expect(component.showInteractiveElements()).toBe(false);

    const renderedItems = Array.from(fixture.debugElement.queryAll(By.directive(LegendItemComponent))).map(
      (i) => i.componentInstance as LegendItemComponent,
    );

    expect(renderedItems).toHaveLength(2);

    for (const renderedItem of renderedItems) {
      expect(renderedItem.showInteractiveElements()).toBe(false);
    }
  });

  it('should update legend items when the store selector changes', () => {
    const firstItems = [createLegendItem('1', 'First legend')];

    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectLegendItemsForDisplay, firstItems);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('legend-item')).toHaveLength(1);

    const updatedItems = [createLegendItem('2', 'Second legend'), createLegendItem('3', 'Third legend')];

    store.overrideSelector(selectLegendItemsForDisplay, updatedItems);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('legend-item')).toHaveLength(2);
  });

  it('should track legend items by id', () => {
    const item = createLegendItem('legend-42', 'Test legend');

    expect(component.trackById(0, item)).toBe('legend-42');
  });
});
