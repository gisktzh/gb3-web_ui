import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ConfigService} from '../../../../shared/services/config.service';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {DrawingStyleActions} from '../../../../state/map/actions/drawing-style.actions';
import {DrawingSettingsDialogComponent} from './drawing-settings-dialog.component';

describe('DrawingSettingsDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  const drawingConfig = {
    defaultFillColor: {r: 255, g: 0, b: 0, a: 0.5},
    defaultLineColor: {r: 0, g: 0, b: 0, a: 1},
    defaultLineWidth: 3,
  };
  let fixture: ComponentFixture<DrawingSettingsDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingSettingsDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}, {provide: ConfigService, useValue: {drawingConfig}}],
    })
      .overrideComponent(DrawingSettingsDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DrawingSettingsDialogComponent);
  });

  it('initializes controls from drawing configuration', () => {
    expect(fixture.componentInstance.fillColor()).toBe('#ff0000');
    expect(fixture.componentInstance.lineColor()).toBe('#000000');
    expect(fixture.componentInstance.lineWidth()).toBe(3);
  });

  it('persists edited styles and closes the dialog', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.fillColor.set('#00ff00');
    fixture.componentInstance.lineColor.set('#ffffff');
    fixture.componentInstance.lineWidth.set(5);
    fixture.componentInstance.saveSettings();
    expect(dispatch).toHaveBeenCalledWith(
      DrawingStyleActions.setDrawingStyles({
        fillColor: ColorUtils.convertHexToSymbolizationColor('#00ff00', 0.5),
        lineColor: ColorUtils.convertHexToSymbolizationColor('#ffffff'),
        lineWidth: 5,
      }),
    );
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
