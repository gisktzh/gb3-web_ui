import {Component, computed, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {StyleExpression} from 'src/app/shared/types/style-expression.type';
import {ResizeHandlerComponent} from '../../../../shared/components/resize-handler/resize-handler.component';
import {selectFilterString} from 'src/app/state/map/reducers/layer-catalog.reducer';
import {selectMapAttributeFiltersItem} from 'src/app/state/map/selectors/map-attribute-filters-item.selector';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {BottomSheetItemComponent} from './bottom-sheet-item.component';
import {immerable} from 'immer';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'resize-handler',
  template: '<div [attr.data-location]="location()" [attr.data-useprimarycolor]="primaryColor()"></div>',
})
class MockResizeHandlerComponent {
  public readonly location = input('');
  public readonly usePrimaryColor = input(false);
  public readonly resizeEvent = output<StyleExpression>();

  public readonly primaryColor = computed(() => (this.usePrimaryColor() ? 'true' : 'false'));
}

describe('BottomSheetItemComponent', () => {
  let component: BottomSheetItemComponent;
  let fixture: ComponentFixture<BottomSheetItemComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const overlayTitle = signal('');
  const usePrimaryColor = signal(false);
  const bottomSheetHeight = signal<'small' | 'medium' | 'large'>('small');
  const showHeader = signal(true);

  beforeEach(async () => {
    overlayTitle.set('');
    usePrimaryColor.set(false);
    bottomSheetHeight.set('small');
    showHeader.set(true);

    await TestBed.configureTestingModule({
      imports: [BottomSheetItemComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(BottomSheetItemComponent, {
        remove: {
          imports: [ResizeHandlerComponent],
        },
        add: {
          imports: [MockResizeHandlerComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectFilterString, undefined);
    store.overrideSelector(selectMapAttributeFiltersItem, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(BottomSheetItemComponent, {
      bindings: [
        inputBinding('overlayTitle', overlayTitle),
        inputBinding('usePrimaryColor', usePrimaryColor),
        inputBinding('bottomSheetHeight', bottomSheetHeight),
        inputBinding('showHeader', showHeader),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should render the overlay title', () => {
      overlayTitle.set('Layer details');
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__title')?.textContent?.trim()).toBe('Layer details');
    });

    it('should render the map attribute filter item title', () => {
      overlayTitle.set('Layer details');
      store.overrideSelector(selectMapAttributeFiltersItem, {
        title: 'Filtered layer',
        settings: {
          type: 'gb2Wms',
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: '',
          layers: [],
          [immerable]: true,
        },
        id: '',
        mapImageUrl: '',
        isSingleLayer: false,
        geometadataUuid: null,
        addToMap: vi.fn(),
        visible: false,
        opacity: 0,
        loadingState: undefined,
        viewProcessState: undefined,
        isTemporary: false,
        [immerable]: true,
      });
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__title')?.textContent?.trim()).toBe(
        'Layer details Filtered layer',
      );
    });

    it('should render the title without an additional title when no filter item exists', () => {
      overlayTitle.set('Layer details');
      store.overrideSelector(selectMapAttributeFiltersItem, undefined);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__title')?.textContent?.trim()).toBe('Layer details');
    });

    it('should render the header by default', () => {
      expect(compiled.querySelector('.bottom-sheet-item__header__container__title')).toBeTruthy();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__hr')).toBeTruthy();
    });

    it('should not render the header content when showHeader is false', () => {
      showHeader.set(false);
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__title')).toBeNull();

      expect(compiled.querySelector('.bottom-sheet-item__header__container__hr')).toBeNull();
    });

    it('should render the body content slot', () => {
      expect(compiled.querySelector('.bottom-sheet-item__content')).toBeTruthy();
    });

    it('should apply the small height class by default', () => {
      const card = compiled.querySelector('.bottom-sheet-item');

      expect(card?.classList.contains('bottom-sheet-item--small')).toBe(true);
      expect(card?.classList.contains('bottom-sheet-item--medium')).toBe(false);
      expect(card?.classList.contains('bottom-sheet-item--large')).toBe(false);
    });

    it('should apply the medium height class when bottomSheetHeight is medium', () => {
      bottomSheetHeight.set('medium');
      fixture.detectChanges();

      const card = compiled.querySelector('.bottom-sheet-item');

      expect(card?.classList.contains('bottom-sheet-item--small')).toBe(false);
      expect(card?.classList.contains('bottom-sheet-item--medium')).toBe(true);
      expect(card?.classList.contains('bottom-sheet-item--large')).toBe(false);
    });

    it('should apply the large height class when bottomSheetHeight is large', () => {
      bottomSheetHeight.set('large');
      fixture.detectChanges();

      const card = compiled.querySelector('.bottom-sheet-item');

      expect(card?.classList.contains('bottom-sheet-item--small')).toBe(false);
      expect(card?.classList.contains('bottom-sheet-item--medium')).toBe(false);
      expect(card?.classList.contains('bottom-sheet-item--large')).toBe(true);
    });

    it('should apply the large height class when a filter string exists', () => {
      store.overrideSelector(selectFilterString, 'some filter');
      store.refreshState();
      fixture.detectChanges();

      const card = compiled.querySelector('.bottom-sheet-item');

      expect(card?.classList.contains('bottom-sheet-item--large')).toBe(true);
      expect(card?.classList.contains('bottom-sheet-item--medium')).toBe(false);
      expect(card?.classList.contains('bottom-sheet-item--small')).toBe(false);
    });

    it('should apply the primary color class to the header', () => {
      usePrimaryColor.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item__header')?.classList.contains('bottom-sheet-item__header--primary-color')).toBe(
        true,
      );
    });

    it('should not apply the primary color class to the header by default', () => {
      expect(compiled.querySelector('.bottom-sheet-item__header')?.classList.contains('bottom-sheet-item__header--primary-color')).toBe(
        false,
      );
    });

    it('should apply the primary color class to the close button', () => {
      usePrimaryColor.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('button')?.classList.contains('bottom-sheet-item__header__container__button--primary--color')).toBe(
        true,
      );
    });

    it('should not apply the primary color class to the close button by default', () => {
      expect(compiled.querySelector('button')?.classList.contains('bottom-sheet-item__header__container__button--primary--color')).toBe(
        false,
      );
    });

    it('should render the close icon', () => {
      expect(compiled.querySelector('mat-icon')?.textContent?.trim()).toBe('close');
    });

    it('should pass the location to the resize handler', () => {
      expect(compiled.querySelector('[data-location]')?.getAttribute('data-location')).toBe('top');
    });

    it('should pass usePrimaryColor to the resize handler', () => {
      expect(compiled.querySelector('[data-useprimarycolor]')?.getAttribute('data-useprimarycolor')).toBe('false');

      usePrimaryColor.set(true);
      fixture.detectChanges();

      expect(compiled.querySelector('[data-useprimarycolor]')?.getAttribute('data-useprimarycolor')).toBe('true');
    });

    it('should update the rendered style when the resize handler emits a style', () => {
      const resizeHandler = fixture.debugElement.query(By.directive(MockResizeHandlerComponent))
        .componentInstance as MockResizeHandlerComponent;

      const style: StyleExpression = {
        height: '420px',
      };

      resizeHandler.resizeEvent.emit(style);
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item')?.getAttribute('style')).toContain('height: 420px');
    });

    it('should reset the rendered style when the close button is clicked', () => {
      const resizeHandler = fixture.debugElement.query(By.directive(MockResizeHandlerComponent))
        .componentInstance as MockResizeHandlerComponent;

      resizeHandler.resizeEvent.emit({height: '420px'});
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item')?.getAttribute('style')).toContain('height: 420px');

      compiled.querySelector<HTMLButtonElement>('button')?.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.bottom-sheet-item')?.getAttribute('style')).toBeNull();
    });
  });

  describe('close', () => {
    it('should dispatch the hide bottom sheet action', () => {
      component.close();

      expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.hideBottomSheet());
    });

    it('should dispatch the hide bottom sheet action when the close button is clicked', () => {
      compiled.querySelector<HTMLButtonElement>('button')?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.hideBottomSheet());
    });
  });
});
