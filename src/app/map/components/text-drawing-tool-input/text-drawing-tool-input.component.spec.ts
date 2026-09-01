import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MapConstants} from '../../../shared/constants/map.constants';
import {TextDrawingToolInputComponent} from './text-drawing-tool-input.component';

describe('TextDrawingToolInputComponent', () => {
  let component: TextDrawingToolInputComponent;
  let fixture: ComponentFixture<TextDrawingToolInputComponent>;
  let compiled: HTMLElement;

  const dialogRefMock: Partial<MatDialogRef<TextDrawingToolInputComponent>> = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextDrawingToolInputComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRefMock}],
    }).compileComponents();

    fixture = TestBed.createComponent(TextDrawingToolInputComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with an empty text', () => {
    expect(component.textModel().text).toBe('');
    expect(component.textForm().valid()).toBe(false);
  });

  it('should expose the configured maximum text length', () => {
    expect(component.maxLength).toBe(MapConstants.TEXT_DRAWING_MAX_LENGTH);
  });

  it('should close the dialog', () => {
    component.close();

    expect(dialogRefMock.close).toHaveBeenCalledOnce();
  });

  it('should update the model when entering text', () => {
    const input = compiled.querySelector<HTMLInputElement>('#name');

    expect(input).not.toBeNull();

    input!.value = 'Test text';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.textModel().text).toBe('Test text');
    expect(component.textForm().valid()).toBe(true);
  });

  it('should disable the add button for an empty text', () => {
    const input = compiled.querySelector<HTMLInputElement>('#name');

    input!.value = '';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = compiled.querySelectorAll<HTMLButtonElement>('button')[1];

    expect(button).not.toBeNull();
    expect(button!.getAttribute('disabled')).toBe('true');
  });

  it('should enable the add button for valid text', () => {
    component.textModel.set({text: 'Test text'});
    fixture.detectChanges();

    const button = compiled.querySelectorAll<HTMLButtonElement>('button')[1];

    expect(button).not.toBeNull();
    expect(button!.getAttribute('disabled')).toBeNull();
  });

  it('should reject whitespace-only text', () => {
    component.textModel.set({text: '   '});
    fixture.detectChanges();

    expect(component.textForm().valid()).toBe(false);

    const button = compiled.querySelectorAll<HTMLButtonElement>('button')[1];

    expect(button).not.toBeNull();
    expect(button!.getAttribute('disabled')).toBe('true');
  });

  it('should accept a single non-whitespace character', () => {
    component.textModel.set({text: 'a'});
    fixture.detectChanges();

    expect(component.textForm().valid()).toBe(true);
  });

  it('should accept text at the maximum length', () => {
    component.textModel.set({text: 'a'.repeat(MapConstants.TEXT_DRAWING_MAX_LENGTH)});
    fixture.detectChanges();

    expect(component.textForm().valid()).toBe(true);
  });

  it('should reject text exceeding the maximum length', () => {
    component.textModel.set({text: 'a'.repeat(MapConstants.TEXT_DRAWING_MAX_LENGTH + 1)});
    fixture.detectChanges();

    expect(component.textForm().valid()).toBe(false);

    const button = compiled.querySelectorAll<HTMLButtonElement>('button')[1];

    expect(button).not.toBeNull();
    expect(button!.getAttribute('disabled')).toBe('true');
  });

  it('should show the validation error after the field has been touched and is invalid', () => {
    const input = compiled.querySelector<HTMLInputElement>('#name');

    expect(input).not.toBeNull();

    input!.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const error = compiled.querySelector('mat-error');

    expect(error).not.toBeNull();
    expect(error!.textContent).toContain('Geben Sie einen gültigen');
  });

  it('should not show the validation error for valid text', () => {
    component.textModel.set({text: 'Valid text'});
    fixture.detectChanges();

    const error = compiled.querySelector('mat-error');

    expect(error).toBeNull();
  });

  it('should reflect the current model value in the input', () => {
    component.textModel.set({text: 'Updated text'});
    fixture.detectChanges();

    const input = compiled.querySelector<HTMLInputElement>('#name');

    expect(input).not.toBeNull();
    expect(input!.value).toBe('Updated text');
  });
});
