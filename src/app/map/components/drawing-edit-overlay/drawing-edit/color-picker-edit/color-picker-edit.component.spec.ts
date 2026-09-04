import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {ColorPickerEditComponent} from './color-picker-edit.component';

describe('ColorPickerEditComponent', () => {
  let component: ColorPickerEditComponent;
  let fixture: ComponentFixture<ColorPickerEditComponent>;
  let compiled: HTMLElement;

  const value = signal('#ff0000');
  const title = signal('Farbe');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPickerEditComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPickerEditComponent, {
      bindings: [twoWayBinding('value', value), inputBinding('title', title)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const label = compiled.querySelector('.color-picker-edit__label');

    expect(label?.textContent?.trim()).toBe('Farbe');
  });

  it('should display the current color value', () => {
    const colorPicker = compiled.querySelector<HTMLInputElement>('.color-picker-edit__color-picker');

    expect(colorPicker).toBeTruthy();
    expect(colorPicker?.value).toBe('#ff0000');
  });

  it('should update the title when the input changes', () => {
    title.set('Neue Farbe');
    fixture.detectChanges();

    const label = compiled.querySelector('.color-picker-edit__label');

    expect(label?.textContent?.trim()).toBe('Neue Farbe');
  });

  it('should update the bound value when the color picker changes', async () => {
    const colorPicker = compiled.querySelector<HTMLInputElement>('.color-picker-edit__color-picker');

    expect(colorPicker).toBeTruthy();

    colorPicker!.value = '#abcdef';
    colorPicker!.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(value()).toBe('#abcdef');
  });

  it('should use the default title when no title is provided', () => {
    const defaultFixture = TestBed.createComponent(ColorPickerEditComponent, {
      bindings: [twoWayBinding('value', signal('#000000'))],
    });

    defaultFixture.detectChanges();

    const defaultComponent = defaultFixture.componentInstance;
    const defaultLabel = defaultFixture.nativeElement.querySelector('.color-picker-edit__label') as HTMLElement;

    expect(defaultComponent.title()).toBe('');
    expect(defaultLabel.textContent?.trim()).toBe('');
  });
});
