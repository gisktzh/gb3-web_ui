import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatExpansionPanel} from '@angular/material/expansion';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemHeaderComponent} from './active-map-item-header.component';
import {inputBinding, signal} from '@angular/core';
import {provideRouter} from '@angular/router';

describe('ActiveMapItemHeaderComponent', () => {
  let component: ActiveMapItemHeaderComponent;
  let fixture: ComponentFixture<ActiveMapItemHeaderComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const activeMapItem = signal({} as ActiveMapItem);
  const activeMapItemExpansionPanel = signal({
    expanded: false,
    toggle: vi.fn(),
  } as unknown as MatExpansionPanel);
  const isDragAndDropDisabled = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemHeaderComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ActiveMapItemHeaderComponent, {
      bindings: [
        inputBinding('activeMapItem', activeMapItem),
        inputBinding('activeMapItemExpansionPanel', activeMapItemExpansionPanel),
        inputBinding('isDragAndDropDisabled', isDragAndDropDisabled),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the expansion panel when the expansion button is clicked', () => {
    const toggleSpy = vi.spyOn(activeMapItemExpansionPanel(), 'toggle');

    compiled.querySelector<HTMLButtonElement>('.active-map-item-header__button')?.click();

    expect(toggleSpy).toHaveBeenCalledOnce();
  });

  it('should show the collapsed icon when the expansion panel is collapsed', () => {
    activeMapItemExpansionPanel.set({
      expanded: false,
      toggle: vi.fn(),
    } as unknown as MatExpansionPanel);
    fixture.detectChanges();

    const button = compiled.querySelector<HTMLButtonElement>('[data-test-id="show-layers-of-the-map"]');
    const icon = button?.querySelector('mat-icon');

    expect(button).toBeTruthy();
    expect(icon?.getAttribute('fonticon')).toBe('arrow_right');
  });

  it('should show the expanded icon when the expansion panel is expanded', () => {
    activeMapItemExpansionPanel.set({
      expanded: true,
      toggle: vi.fn(),
    } as unknown as MatExpansionPanel);
    fixture.detectChanges();

    const button = compiled.querySelector<HTMLButtonElement>('[data-test-id="hide-layers-of-the-map"]');
    const icon = button?.querySelector('mat-icon');

    expect(button).toBeTruthy();
    expect(icon?.getAttribute('fonticon')).toBe('arrow_drop_down');
  });

  it('should toggle map item visibility', () => {
    const item = {
      ...activeMapItem(),
      visible: true,
      addToMap: vi.fn(),
    };

    component.toggleMapItemVisibility(item);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.setVisibility({
        visible: false,
        activeMapItem: item,
      }),
    );
  });

  it('should toggle map item visibility from false to true', () => {
    const item = {
      ...activeMapItem(),
      visible: false,
    } as ActiveMapItem;

    component.toggleMapItemVisibility(item);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.setVisibility({
        visible: true,
        activeMapItem: item,
      }),
    );
  });

  it('should remove the active map item', () => {
    const item = activeMapItem();

    component.removeActiveMapItem(item);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.removeActiveMapItem({
        activeMapItem: item,
      }),
    );
  });

  it('should dispatch visibility action when the checkbox changes', () => {
    const item = {
      ...activeMapItem(),
      visible: true,
      addToMap: vi.fn(),
    };

    activeMapItem.set(item);
    fixture.detectChanges();

    const checkbox = compiled.querySelector<HTMLElement>('.active-map-item-header__image-container__checkbox');
    checkbox?.dispatchEvent(new Event('change'));

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.setVisibility({
        visible: false,
        activeMapItem: item,
      }),
    );
  });

  it('should dispatch remove action when the delete button is clicked', () => {
    const item = activeMapItem();
    activeMapItem.set(item);
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('[data-test-id="delete"]')?.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.removeActiveMapItem({
        activeMapItem: item,
      }),
    );
  });

  it('should display the map image when the item has multiple layers and an image URL', () => {
    activeMapItem.set({
      ...activeMapItem(),
      isSingleLayer: false,
      mapImageUrl: 'https://example.com/map.png',
      title: 'Test map',
      visible: true,
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    const image = compiled.querySelector<HTMLImageElement>('.active-map-item-header__image-container__image');

    expect(image).toBeTruthy();
    expect(image?.src).toBe('https://example.com/map.png');
    expect(image?.alt).toBe('Test map');
  });

  it('should not display the map image for a single-layer item', () => {
    activeMapItem.set({
      ...activeMapItem(),
      isSingleLayer: true,
      mapImageUrl: 'https://example.com/map.png',
    } as ActiveMapItem);
    fixture.detectChanges();

    expect(compiled.querySelector('.active-map-item-header__image-container__image')).toBeNull();
  });

  it('should not display the map image when no image URL is available', () => {
    activeMapItem.set({
      ...activeMapItem(),
      isSingleLayer: false,
      mapImageUrl: null,
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    expect(compiled.querySelector('.active-map-item-header__image-container__image')).toBeNull();
  });

  it('should display the info link when geometadataUuid is available', () => {
    activeMapItem.set({
      ...activeMapItem(),
      geometadataUuid: 'abc-123',
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    const infoLink = compiled.querySelector<HTMLAnchorElement>('[data-test-id="info"]');

    expect(infoLink).toBeTruthy();
    expect(infoLink?.getAttribute('href')).toContain('abc-123');
  });

  it('should not display the info link when geometadataUuid is not available', () => {
    activeMapItem.set({
      ...activeMapItem(),
      geometadataUuid: null,
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    expect(compiled.querySelector('[data-test-id="info"]')).toBeNull();
  });

  it('should mark the title inactive when the map item is not visible', () => {
    activeMapItem.set({
      ...activeMapItem(),
      title: 'Test map',
      visible: false,
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    const title = compiled.querySelector('.active-map-item-header__title-container__title');

    expect(title?.classList.contains('active-map-item-header__title-container__title--inactive')).toBe(true);
  });

  it('should mark the title as inverted when the expansion panel is expanded', () => {
    activeMapItemExpansionPanel.set({
      expanded: true,
      toggle: vi.fn(),
    } as unknown as MatExpansionPanel);
    fixture.detectChanges();

    const title = compiled.querySelector('.active-map-item-header__title-container__title');

    expect(title?.classList.contains('active-map-item-header__title-container__title--inverted')).toBe(true);
  });

  it('should mark the options as mobile in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const options = compiled.querySelector('.active-map-item-header__title-container__options');

    expect(options?.classList.contains('active-map-item-header__title-container__options--mobile')).toBe(true);
  });

  it('should not mark the options as mobile in regular screen mode', () => {
    const options = compiled.querySelector('.active-map-item-header__title-container__options');

    expect(options?.classList.contains('active-map-item-header__title-container__options--mobile')).toBe(false);
  });

  it('should mark the drag handle as disabled when drag and drop is disabled', () => {
    isDragAndDropDisabled.set(true);
    fixture.detectChanges();

    const dragIcon = compiled.querySelector('.active-map-item-header__drag-handle__icon');

    expect(dragIcon?.classList.contains('active-map-item-header__drag-handle__icon--disabled')).toBe(true);
  });

  it('should not mark the drag handle as disabled when drag and drop is enabled', () => {
    isDragAndDropDisabled.set(false);
    fixture.detectChanges();

    const dragIcon = compiled.querySelector('.active-map-item-header__drag-handle__icon');

    expect(dragIcon?.classList.contains('active-map-item-header__drag-handle__icon--disabled')).toBe(false);
  });
});
