import {Component, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DrawingActions} from '../../../state/map/actions/drawing.actions';
import {selectIsDrawingEditOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {MapOverlayComponent} from '../map-overlay/map-overlay.component';
import {DrawingEditComponent} from './drawing-edit/drawing-edit.component';
import {DrawingEditOverlayComponent} from './drawing-edit-overlay.component';

@Component({selector: 'map-overlay', template: '<ng-content />'})
class MapOverlayStubComponent {
  public readonly width = input<number>();
  public readonly isVisible = input(false);
  public readonly showPrintButton = input(true);
  public readonly overlayTitle = input('');
  public readonly location = input('left');
  public readonly closeEvent = output<void>();
  public readonly resizeEvent = output<number>();
}

@Component({selector: 'drawing-edit', template: ''})
class DrawingEditStubComponent {}

describe('DrawingEditOverlayComponent', () => {
  let fixture: ComponentFixture<DrawingEditOverlayComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingEditOverlayComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(DrawingEditOverlayComponent, {
        remove: {imports: [MapOverlayComponent, DrawingEditComponent]},
        add: {imports: [MapOverlayStubComponent, DrawingEditStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsDrawingEditOverlayVisible, false);
    fixture = TestBed.createComponent(DrawingEditOverlayComponent);
    fixture.componentRef.setInput('width', 420);
    fixture.detectChanges();
  });

  it('configures the right-side edit overlay from state', () => {
    const overlay = fixture.debugElement.query(By.directive(MapOverlayStubComponent)).componentInstance as MapOverlayStubComponent;

    expect(overlay.width()).toBe(420);
    expect(overlay.isVisible()).toBe(false);
    expect(overlay.showPrintButton()).toBe(false);
    expect(overlay.overlayTitle()).toBe('Darstellung anpassen');
    expect(overlay.location()).toBe('right');

    store.overrideSelector(selectIsDrawingEditOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();
    expect(overlay.isVisible()).toBe(true);
  });

  it('forwards resize events to its container', () => {
    const resized = vi.fn();
    fixture.componentInstance.resizeEvent.subscribe(resized);
    const overlay = fixture.debugElement.query(By.directive(MapOverlayStubComponent)).componentInstance as MapOverlayStubComponent;

    overlay.resizeEvent.emit(512);

    expect(resized).toHaveBeenCalledWith(512);
  });

  it('cancels edit mode when the overlay closes', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const overlay = fixture.debugElement.query(By.directive(MapOverlayStubComponent)).componentInstance as MapOverlayStubComponent;

    overlay.closeEvent.emit();

    expect(dispatch).toHaveBeenCalledWith(DrawingActions.cancelEditMode());
  });
});
