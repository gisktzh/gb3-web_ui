import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Mock} from 'vitest';
import {MapOverlayComponent} from './map-overlay.component';
import {ResizeHandlerLocation} from '../../../shared/types/resize-handler-location.type';
import {StyleExpression} from '../../../shared/types/style-expression.type';
import {LoadingState} from '../../../shared/types/loading-state.type';

describe('MapOverlayComponent', () => {
  let component: MapOverlayComponent;
  let fixture: ComponentFixture<MapOverlayComponent>;
  let compiled: HTMLElement;
  let closeEventSpy: Mock;
  let printButtonEventSpy: Mock;

  const showPrintButton = signal<boolean | undefined>(undefined);
  const isPrintButtonEnabled = signal<boolean | undefined>(undefined);
  const printLoadingState = signal<LoadingState | undefined>(undefined);
  const isVisible = signal<boolean | undefined>(undefined);
  const overlayTitle = signal<string | undefined>(undefined);
  const location = signal<ResizeHandlerLocation | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapOverlayComponent],
      providers: [],
    }).compileComponents();

    showPrintButton.set(undefined);
    isPrintButtonEnabled.set(undefined);
    printLoadingState.set(undefined);
    isVisible.set(undefined);
    overlayTitle.set(undefined);
    location.set(undefined);

    fixture = TestBed.createComponent(MapOverlayComponent, {
      bindings: [
        inputBinding('showPrintButton', showPrintButton),
        inputBinding('isPrintButtonEnabled', isPrintButtonEnabled),
        inputBinding('printLoadingState', printLoadingState),
        inputBinding('isVisible', isVisible),
        inputBinding('overlayTitle', overlayTitle),
        inputBinding('location', location),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    closeEventSpy = vi.spyOn(component.closeEvent, 'emit');
    printButtonEventSpy = vi.spyOn(component.printButtonEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the overlay when it is not visible', () => {
    isVisible.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay')).toBeNull();
  });

  it('should render the overlay when it is visible', () => {
    isVisible.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay')).toBeTruthy();
  });

  it('should render the overlay title', () => {
    isVisible.set(true);
    overlayTitle.set('Legende');
    fixture.detectChanges();

    const title = compiled.querySelector('.map-overlay__header__title');

    expect(title?.textContent?.trim()).toBe('Legende');
  });

  it('should render the print button when showPrintButton is true', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay__print-button')).toBeTruthy();
  });

  it('should not render the print button when showPrintButton is false', () => {
    isVisible.set(true);
    showPrintButton.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay__print-button')).toBeNull();
  });

  it('should render the overlay title in the print button', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    overlayTitle.set('Legende');
    fixture.detectChanges();

    const printButton = compiled.querySelector('.map-overlay__print-button');

    expect(printButton?.textContent).toContain('Legende drucken');
  });

  it('should disable the print button when printing is not enabled', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    isPrintButtonEnabled.set(false);
    fixture.detectChanges();

    const printButton = compiled.querySelector<HTMLButtonElement>('.map-overlay__print-button');

    expect(printButton?.disabled).toBe(true);
  });

  it('should enable the print button when printing is enabled and not loading', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    isPrintButtonEnabled.set(true);
    printLoadingState.set('loaded');
    fixture.detectChanges();

    const printButton = compiled.querySelector<HTMLButtonElement>('.map-overlay__print-button');

    expect(printButton?.disabled).toBe(false);
  });

  it('should disable the print button while printing is loading', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    isPrintButtonEnabled.set(true);
    printLoadingState.set('loading');
    fixture.detectChanges();

    const printButton = compiled.querySelector<HTMLButtonElement>('.map-overlay__print-button');

    expect(printButton?.disabled).toBe(true);
  });

  it('should emit printButtonEvent when the print button is clicked', () => {
    isVisible.set(true);
    showPrintButton.set(true);
    isPrintButtonEnabled.set(true);
    printLoadingState.set('loaded');
    fixture.detectChanges();

    const printButton = compiled.querySelector<HTMLButtonElement>('.map-overlay__print-button');

    printButton?.click();

    expect(printButtonEventSpy).toHaveBeenCalledOnce();
  });

  it('should emit closeEvent when the close button is clicked', () => {
    isVisible.set(true);
    fixture.detectChanges();

    const closeButton = compiled.querySelector<HTMLButtonElement>('.map-overlay__header button');

    closeButton?.click();

    expect(closeEventSpy).toHaveBeenCalledOnce();
  });

  it('should reset the resizeable style when the overlay is closed', () => {
    const style: StyleExpression = {
      width: '500px',
      height: '300px',
    };

    component.resizeOverlay(style);
    expect(component.resizeableStyle()).toEqual(style);

    component.onClose();

    expect(component.resizeableStyle()).toEqual({});
  });

  it('should update the resizeable style when the overlay is resized', () => {
    const style: StyleExpression = {
      width: '500px',
      height: '300px',
    };

    component.resizeOverlay(style);

    expect(component.resizeableStyle()).toEqual(style);
  });

  it('should apply the resizeable style to the overlay', () => {
    isVisible.set(true);

    const style: StyleExpression = {
      width: '500px',
      height: '300px',
    };

    component.resizeOverlay(style);
    fixture.detectChanges();

    const overlay = compiled.querySelector<HTMLElement>('.map-overlay');

    expect(overlay?.style.width).toBe('500px');
    expect(overlay?.style.height).toBe('300px');
  });

  it('should add the right class when the location is right', () => {
    isVisible.set(true);
    location.set('right');
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay--right')).toBeTruthy();
  });

  it('should not add the right class when the location is left', () => {
    isVisible.set(true);
    location.set('left');
    fixture.detectChanges();

    expect(compiled.querySelector('.map-overlay--right')).toBeNull();
  });

  it('should render the loading and process bar', () => {
    isVisible.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('loading-and-process-bar')).toBeTruthy();
  });

  it('should render the resize handler', () => {
    isVisible.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('resize-handler')).toBeTruthy();
  });

  it('should pass the location to the resize handler', () => {
    isVisible.set(true);
    location.set('right');
    fixture.detectChanges();

    const resizeHandler = fixture.debugElement.query(By.css('resize-handler')).componentInstance;

    expect(resizeHandler.location()).toBe('right');
  });

  it('should reset the resizeable style and emit closeEvent when onClose is called', () => {
    const style: StyleExpression = {
      width: '400px',
    };

    component.resizeOverlay(style);

    component.onClose();

    expect(component.resizeableStyle()).toEqual({});
    expect(closeEventSpy).toHaveBeenCalledOnce();
  });

  it('should emit printButtonEvent when onPrintButtonClick is called', () => {
    component.onPrintButtonClick();

    expect(printButtonEventSpy).toHaveBeenCalledOnce();
  });
});
