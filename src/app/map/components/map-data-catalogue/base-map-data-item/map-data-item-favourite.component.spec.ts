import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
import {MapDataItemFavouriteComponent} from './map-data-item-favourite.component';
import {LoadingState} from '../../../../shared/types/loading-state.type';

describe('MapDataItemFavouriteComponent', () => {
  let component: MapDataItemFavouriteComponent;
  let fixture: ComponentFixture<MapDataItemFavouriteComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const title = signal('Favourite map');
  const filterString = signal<string | undefined>(undefined);
  const loadingState = signal<LoadingState>('loaded');
  const invalid = signal(false);

  beforeEach(async () => {
    title.set('Favourite map');
    filterString.set(undefined);
    loadingState.set('loaded');
    invalid.set(false);

    await TestBed.configureTestingModule({
      imports: [MapDataItemFavouriteComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveTool, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(MapDataItemFavouriteComponent, {
      bindings: [
        inputBinding('title', title),
        inputBinding('filterString', filterString),
        inputBinding('loadingState', loadingState),
        inputBinding('invalid', invalid),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('favourite-specific state', () => {
    it('should never show the expand button', () => {
      expect(component.showExpandButton()).toBe(false);

      const expandButton = compiled.querySelector('[data-test-id="show-layers-of-the-map"]') as HTMLButtonElement | null;

      expect(expandButton).not.toBeNull();
      expect(expandButton?.classList.contains('base-map-data-item__header__expand-button--hidden')).toBe(true);
    });

    it('should show the delete button', () => {
      const deleteIcon = Array.from(compiled.querySelectorAll('mat-icon')).find((icon) => icon.textContent?.trim() === 'delete');

      expect(deleteIcon).not.toBeUndefined();

      const deleteButton = deleteIcon?.closest('button');

      expect(deleteButton).not.toBeNull();
    });

    it('should use the favourite error tooltip when invalid', () => {
      invalid.set(true);
      fixture.detectChanges();

      expect(component.errorTooltip()).toContain('Der Favorit kann nicht angezeigt werden');

      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      expect(header).not.toBeNull();
    });
  });

  describe('isAddItemDisabled', () => {
    it('should be false when no tool is active', () => {
      store.overrideSelector(selectActiveTool, undefined);
      store.refreshState();
      fixture.detectChanges();

      expect(component.isAddItemDisabled()).toBe(false);

      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement | null;

      expect(addButton).not.toBeNull();
      expect(addButton?.disabled).toBe(false);
    });

    it('should be true when a tool is active', () => {
      store.overrideSelector(selectActiveTool, 'draw-point');
      store.refreshState();
      fixture.detectChanges();

      expect(component.isAddItemDisabled()).toBe(true);

      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement | null;

      expect(addButton).not.toBeNull();
      expect(addButton?.disabled).toBe(true);
    });
  });

  describe('invalid input', () => {
    it('should enable the add button when the favourite is valid and no tool is active', () => {
      invalid.set(false);
      store.overrideSelector(selectActiveTool, undefined);
      store.refreshState();
      fixture.detectChanges();

      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement | null;

      expect(addButton?.disabled).toBe(false);
      expect(addButton?.getAttribute('aria-label')).toBe('Karte hinzufügen');
    });

    it('should disable the add button when the favourite is invalid', () => {
      invalid.set(true);
      fixture.detectChanges();

      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement | null;

      expect(addButton?.disabled).toBe(true);
      expect(addButton?.getAttribute('aria-label')).toBe('Bei dieser Karte ist ein Fehler ist aufgetreten');

      const icon = addButton?.querySelector('mat-icon');

      expect(icon?.getAttribute('fonticon')).toBe('error');
    });

    it('should render the invalid title class when the favourite is invalid', () => {
      invalid.set(true);
      fixture.detectChanges();

      const titleElement = compiled.querySelector('.base-map-data-item__header__title');

      expect(titleElement).not.toBeNull();
      expect(titleElement?.classList.contains('base-map-data-item__header__title--disabled')).toBe(true);
    });

    it('should render the normal title state when the favourite is valid', () => {
      invalid.set(false);
      fixture.detectChanges();

      const titleElement = compiled.querySelector('.base-map-data-item__header__title');

      expect(titleElement).not.toBeNull();
      expect(titleElement?.classList.contains('base-map-data-item__header__title--disabled')).toBe(false);
    });
  });

  describe('loadingState input', () => {
    it('should accept the loaded loading state', () => {
      loadingState.set('loaded');
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loaded');
      expect(compiled.querySelector('loading-and-process-bar')).not.toBeNull();
    });

    it('should accept the loading state', () => {
      loadingState.set('loading');
      fixture.detectChanges();

      expect(component.loadingState()).toBe('loading');
      expect(compiled.querySelector('loading-and-process-bar')).not.toBeNull();
    });
  });

  describe('inherited add behavior', () => {
    it('should emit addEvent when the add button is clicked while enabled', () => {
      store.overrideSelector(selectActiveTool, undefined);
      store.refreshState();
      invalid.set(false);
      fixture.detectChanges();

      const emitSpy = vi.spyOn(component.addEvent, 'emit');

      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement;

      addButton.click();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('inherited delete behavior', () => {
    it('should emit deleteEvent when the delete button is clicked', () => {
      const emitSpy = vi.spyOn(component.deleteEvent, 'emit');

      const deleteIcon = Array.from(compiled.querySelectorAll('mat-icon')).find((icon) => icon.textContent?.trim() === 'delete');

      expect(deleteIcon).not.toBeUndefined();

      const deleteButton = deleteIcon?.closest('button') as HTMLButtonElement | null;

      expect(deleteButton).not.toBeNull();

      deleteButton?.click();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('title input', () => {
    it('should render the supplied title', () => {
      title.set('My favourite');
      fixture.detectChanges();

      const titleElement = compiled.querySelector('.base-map-data-item__header__title');

      expect(titleElement?.textContent).toContain('My favourite');
    });
  });
});
