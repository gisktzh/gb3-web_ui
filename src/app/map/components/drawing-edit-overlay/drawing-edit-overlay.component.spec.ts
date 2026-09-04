import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {DrawingActions} from '../../../state/map/actions/drawing.actions';
import {selectIsDrawingEditOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {DrawingEditOverlayComponent} from './drawing-edit-overlay.component';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {DrawingEditComponent} from './drawing-edit/drawing-edit.component';
import {Component, input, output} from '@angular/core';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {ResizeHandlerLocation} from 'src/app/shared/types/resize-handler-location.type';

describe('DrawingEditOverlayComponent', () => {
  let component: DrawingEditOverlayComponent;
  let fixture: ComponentFixture<DrawingEditOverlayComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const drawingSymbolsServiceMock: Partial<DrawingSymbolsService> = {
    getCollectionInfos: vi.fn(),
  };

  @Component({
    selector: 'map-overlay',
    template: '<div id="map-overlay"><ng-content /></div>',
  })
  class MockMapOverlayComponent {
    public readonly showPrintButton = input(true);
    public readonly isPrintButtonEnabled = input(false);
    public readonly printLoadingState = input<LoadingState>();
    public readonly isVisible = input(false);
    public readonly overlayTitle = input('');
    public readonly location = input<ResizeHandlerLocation>('left');
    public readonly closeEvent = output();
    public readonly printButtonEvent = output();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingEditOverlayComponent],
      providers: [
        provideMockStore(),
        {
          provide: DRAWING_SYMBOLS_SERVICE,
          useValue: drawingSymbolsServiceMock,
        },
      ],
    })
      .overrideComponent(DrawingEditOverlayComponent, {
        remove: {
          imports: [MapOverlayComponent],
        },
        add: {
          imports: [MockMapOverlayComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsDrawingEditOverlayVisible, false);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(DrawingEditOverlayComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the map overlay', () => {
    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.isVisible()).toBe(false);
    expect(overlayComponent.showPrintButton()).toBe(false);
    expect(overlayComponent.overlayTitle()).toBe('Darstellung anpassen');
    expect(overlayComponent.location()).toBe('right');
  });

  it('should render the drawing edit component', () => {
    expect(fixture.debugElement.query(By.directive(DrawingEditComponent))).toBeTruthy();
  });

  it('should hide the overlay when the selector returns false', () => {
    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.isVisible()).toBe(false);
  });

  it('should show the overlay when the selector returns true', () => {
    store.overrideSelector(selectIsDrawingEditOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    expect(overlayComponent.isVisible()).toBe(true);
  });

  it('should dispatch cancelEditMode when the overlay emits closeEvent', () => {
    const overlay = fixture.debugElement.query(By.directive(MockMapOverlayComponent));
    const overlayComponent = overlay.componentInstance;

    overlayComponent.closeEvent.emit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(DrawingActions.cancelEditMode());
  });

  it('should dispatch cancelEditMode when close is called', () => {
    component.close();

    expect(storeDispatchSpy).toHaveBeenCalledWith(DrawingActions.cancelEditMode());
  });
});
