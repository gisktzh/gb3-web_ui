import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectHideToggleUiElementsButton, selectHideUiElements} from 'src/app/state/map/reducers/map-ui.reducer';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {UiToggleComponent} from './ui-toggle.component';

describe('UiToggleComponent', () => {
  let component: UiToggleComponent;
  let fixture: ComponentFixture<UiToggleComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiToggleComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectHideUiElements, false);
    store.overrideSelector(selectHideToggleUiElementsButton, false);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(UiToggleComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the toggle button when the button is not hidden', () => {
    const button = compiled.querySelector('[data-test-id="ui-toggle"]');

    expect(button).toBeTruthy();
  });

  it('should not render the toggle button when it is hidden', () => {
    store.overrideSelector(selectHideToggleUiElementsButton, true);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('[data-test-id="ui-toggle"]')).toBeNull();
  });

  it('should render the slide toggle with the checked state', () => {
    const slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle)).componentInstance as MatSlideToggle;

    expect(slideToggle.checked).toBe(false);
  });

  it('should update the slide toggle when the checked state changes', () => {
    store.overrideSelector(selectHideUiElements, true);
    store.refreshState();
    fixture.detectChanges();

    const slideToggle = fixture.debugElement.query(By.directive(MatSlideToggle)).componentInstance as MatSlideToggle;

    expect(slideToggle.checked).toBe(true);
  });

  it('should show the correct tooltip and aria label when UI elements are visible', () => {
    const button = compiled.querySelector('[data-test-id="ui-toggle"]');

    expect(button?.getAttribute('aria-label')).toBe('Ui-Elemente verbergen');
  });

  it('should show the correct tooltip and aria label when UI elements are hidden', () => {
    store.overrideSelector(selectHideUiElements, true);
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="ui-toggle"]');

    expect(button?.getAttribute('aria-label')).toBe('Ui-Elemente anzeigen');
  });

  it('should dispatch the action to hide UI elements when they are currently visible', () => {
    const button = compiled.querySelector('[data-test-id="ui-toggle"]') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.changeUiElementsVisibility({
        hideAllUiElements: true,
        hideUiToggleButton: false,
      }),
    );
  });

  it('should dispatch the action to show UI elements when they are currently hidden', () => {
    store.overrideSelector(selectHideUiElements, true);
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('[data-test-id="ui-toggle"]') as HTMLButtonElement;

    button.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.changeUiElementsVisibility({
        hideAllUiElements: false,
        hideUiToggleButton: false,
      }),
    );
  });

  it('should toggle UI element visibility through the public method', () => {
    component.toggleUiElementsVisibility();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.changeUiElementsVisibility({
        hideAllUiElements: true,
        hideUiToggleButton: false,
      }),
    );
  });
});
