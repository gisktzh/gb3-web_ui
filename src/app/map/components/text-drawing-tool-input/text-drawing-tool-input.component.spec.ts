import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MapConstants} from '../../../shared/constants/map.constants';
import {TextDrawingToolInputComponent} from './text-drawing-tool-input.component';

describe('TextDrawingToolInputComponent', () => {
  let fixture: ComponentFixture<TextDrawingToolInputComponent>;
  const dialogRef = {close: vi.fn()};

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TextDrawingToolInputComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRef}],
    }).compileComponents();
    fixture = TestBed.createComponent(TextDrawingToolInputComponent);
    fixture.detectChanges();
  });

  it('keeps the add action disabled until valid non-whitespace text is entered', () => {
    const button = fixture.debugElement.query(By.directive(MatDialogClose)).nativeElement as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    fixture.componentInstance.textModel.set({text: 'Beschriftung'});
    fixture.detectChanges();

    expect(button.disabled).toBe(false);
  });

  it('rejects whitespace and text over the configured limit', () => {
    fixture.componentInstance.textModel.set({text: '   '});
    fixture.detectChanges();
    expect(fixture.componentInstance.textForm().valid()).toBe(false);

    fixture.componentInstance.textModel.set({text: 'x'.repeat(MapConstants.TEXT_DRAWING_MAX_LENGTH + 1)});
    fixture.detectChanges();
    expect(fixture.componentInstance.textForm().valid()).toBe(false);
  });

  it('returns the entered text through the add action', () => {
    fixture.componentInstance.textModel.set({text: 'Beschriftung'});
    fixture.detectChanges();
    const close = fixture.debugElement.query(By.directive(MatDialogClose)).injector.get(MatDialogClose);

    expect(close.dialogResult).toBe('Beschriftung');
  });

  it('closes without a result when cancelled', () => {
    fixture.componentInstance.close();

    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
