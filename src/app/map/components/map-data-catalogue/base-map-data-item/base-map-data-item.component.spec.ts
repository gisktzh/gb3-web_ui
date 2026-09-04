import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {Mock} from 'vitest';
import {BaseMapDataItemComponent} from './base-map-data-item.component';

describe('BaseMapDataItemComponent', () => {
  let component: BaseMapDataItemComponent;
  let fixture: ComponentFixture<BaseMapDataItemComponent>;
  let compiled: HTMLElement;

  const title = signal('Test map');
  const filterString = signal<string | undefined>(undefined);

  let addEventSpy: Mock;
  let hoverStartEventSpy: Mock;
  let hoverEndEventSpy: Mock;
  let deleteEventSpy: Mock;

  beforeEach(async () => {
    title.set('Test map');
    filterString.set(undefined);

    await TestBed.configureTestingModule({
      imports: [BaseMapDataItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseMapDataItemComponent, {
      bindings: [inputBinding('title', title), inputBinding('filterString', filterString)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();

    addEventSpy = vi.spyOn(component.addEvent, 'emit');
    hoverStartEventSpy = vi.spyOn(component.hoverStartEvent, 'emit');
    hoverEndEventSpy = vi.spyOn(component.hoverEndEvent, 'emit');
    deleteEventSpy = vi.spyOn(component.deleteEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('title', () => {
    it('should render the title', () => {
      expect(compiled.querySelector('.base-map-data-item__header__title')?.textContent).toContain('Test map');
    });

    it('should update the rendered title when the bound title signal changes', () => {
      title.set('Updated map');
      fixture.detectChanges();

      expect(compiled.querySelector('.base-map-data-item__header__title')?.textContent).toContain('Updated map');
    });
  });

  describe('image', () => {
    it('should render the image placeholder when no image URL is available', () => {
      expect(compiled.querySelector('.base-map-data-item__header__image-container__image-placeholder')).not.toBeNull();

      expect(compiled.querySelector('.base-map-data-item__header__image-container__image')).toBeNull();
    });
  });

  describe('expand button', () => {
    it('should render the expand button in its initial collapsed state', () => {
      const expandButton = compiled.querySelector('[data-test-id="show-layers-of-the-map"]') as HTMLButtonElement | null;

      expect(expandButton).not.toBeNull();
      expect(expandButton?.disabled).toBe(true);

      const icon = expandButton?.querySelector('mat-icon');

      expect(icon?.getAttribute('fonticon')).toBe('arrow_right');
      expect(icon?.getAttribute('aria-label')).toBe('Pfeil nach rechts');
    });

    it('should disable the expand button when there are no layers', () => {
      const expandButton = compiled.querySelector('[data-test-id="show-layers-of-the-map"]') as HTMLButtonElement | null;

      expect(expandButton?.disabled).toBe(true);
    });

    it('should not display a filtered layer count when no filter is active', () => {
      expect(component.filteredLayersCount()).toBe(0);

      const badge = compiled.querySelector('.mat-badge-content');

      expect(badge?.textContent).toBe('0');
    });

    it('should calculate the filtered layer count when a filter is active', () => {
      filterString.set('test');
      fixture.detectChanges();

      expect(component.filteredLayersCount()).toBe(0);
    });

    it('should calculate the filtered layer count case-insensitively', () => {
      filterString.set('TEST');
      fixture.detectChanges();

      expect(component.filteredLayersCount()).toBe(0);
    });
  });

  describe('add button', () => {
    it('should render the add button when no gb2 URL is configured', () => {
      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement | null;

      expect(addButton).not.toBeNull();
      expect(addButton?.disabled).toBe(false);
      expect(addButton?.getAttribute('aria-label')).toBe('Karte hinzufügen');

      const icon = addButton?.querySelector('mat-icon');

      expect(icon?.getAttribute('fonticon')).toBe('add');
    });

    it('should emit addEvent when the add button is clicked', () => {
      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement;

      addButton.click();

      expect(addEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit addEvent when addItem is called', () => {
      component.addItem();

      expect(addEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation for Enter on the add button', () => {
      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement;

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      addButton.dispatchEvent(event);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation for Space on the add button', () => {
      const addButton = compiled.querySelector('[data-test-id="add-active-map"]') as HTMLButtonElement;

      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      addButton.dispatchEvent(event);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete button', () => {
    it('should not render the delete button when showDeleteButton is false', () => {
      expect(compiled.querySelector('.base-map-data-item__header mat-icon[fonticon="delete"]')).toBeNull();
    });

    it('should render the delete button when showDeleteButton is true', () => {
      component.showDeleteButton.set(true);
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.base-map-data-item__header button[data-testid="deleteBtn"]');

      expect(deleteButton).not.toBeNull();
    });

    it('should emit deleteEvent when the delete button is clicked', () => {
      component.showDeleteButton.set(true);
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.base-map-data-item__header button[data-testid="deleteBtn"]') as HTMLElement;

      deleteButton?.click();

      expect(deleteEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit deleteEvent when deleteItem is called', () => {
      component.deleteItem();

      expect(deleteEventSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation for Enter on the delete button', () => {
      component.showDeleteButton.set(true);
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.base-map-data-item__header button[data-testid="deleteBtn"]');

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      deleteButton?.dispatchEvent(event);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation for Space on the delete button', () => {
      component.showDeleteButton.set(true);
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.base-map-data-item__header button[data-testid="deleteBtn"]');

      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true,
      });
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      deleteButton?.dispatchEvent(event);

      expect(stopPropagationSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('hover', () => {
    it('should set the map hover state when setIsHovered is called without a layer', () => {
      expect(component.isMapHovered()).toBe(false);

      component.setIsHovered();

      expect(component.isMapHovered()).toBe(true);
    });

    it('should emit hoverStartEvent when hoverStart is called without a layer', () => {
      component.hoverStart();

      expect(hoverStartEventSpy).toHaveBeenCalledTimes(1);
      expect(hoverStartEventSpy).toHaveBeenCalledWith(undefined);
    });

    it('should clear the map hover state when hoverEnd is called', () => {
      component.setIsHovered();

      expect(component.isMapHovered()).toBe(true);

      component.hoverEnd();

      expect(component.isMapHovered()).toBe(false);
      expect(component.hoveredLayer()).toBeUndefined();
    });

    it('should emit hoverEndEvent when hoverEnd is called without a layer', () => {
      component.hoverEnd();

      expect(hoverEndEventSpy).toHaveBeenCalledTimes(1);
      expect(hoverEndEventSpy).toHaveBeenCalledWith(undefined);
    });

    it('should set the map hover state through the header mouseenter event', () => {
      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(component.isMapHovered()).toBe(true);
    });

    it('should clear the map hover state through the header mouseleave event', () => {
      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      header.dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      expect(component.isMapHovered()).toBe(false);
      expect(component.hoveredLayer()).toBeUndefined();
      expect(hoverEndEventSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit hoverStartEvent through the delayed mouseenter event', () => {
      const header = compiled.querySelector('.base-map-data-item__header') as HTMLElement;

      header.dispatchEvent(
        new CustomEvent('delayedMouseEnter', {
          bubbles: true,
        }),
      );

      expect(hoverStartEventSpy).toHaveBeenCalledTimes(1);
      expect(hoverStartEventSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('filter input', () => {
    it('should pass the filter string to the component computation', () => {
      filterString.set('map');
      fixture.detectChanges();

      expect(component.filteredLayersCount()).toBe(0);
    });

    it('should handle an empty filter string', () => {
      filterString.set('');
      fixture.detectChanges();

      expect(component.filteredLayersCount()).toBe(0);
    });
  });
});
