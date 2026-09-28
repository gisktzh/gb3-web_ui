import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColorPickerEditComponent} from './color-picker-edit.component';

describe('ColorPickerEditComponent', () => {
  let fixture: ComponentFixture<ColorPickerEditComponent>;
  const value = signal('#ff0000');

  beforeEach(async () => {
    value.set('#ff0000');
    await TestBed.configureTestingModule({imports: [ColorPickerEditComponent]}).compileComponents();
    fixture = TestBed.createComponent(ColorPickerEditComponent, {
      bindings: [twoWayBinding('value', value), inputBinding('title', () => 'Farbe')],
    });
    fixture.detectChanges();
  });

  it('shows the label and current color', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(fixture.nativeElement.textContent).toContain('Farbe');
    expect(input.value).toBe('#ff0000');
  });

  it('updates the bound value when the user chooses a color', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '#abcdef';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(value()).toBe('#abcdef');
  });
});
