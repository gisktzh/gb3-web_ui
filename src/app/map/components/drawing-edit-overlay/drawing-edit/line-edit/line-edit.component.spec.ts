import {Component, input, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {LineEditComponent} from './line-edit.component';

@Component({
  selector: 'slider-edit',
  template: '',
})
class MockSliderEditComponent {
  public readonly formField = input<unknown>();
  public readonly minValue = input<number>();
  public readonly maxValue = input<number>();
  public readonly step = input<number>();
  public readonly title = input('');
}

@Component({
  selector: 'color-picker-edit',
  template: '',
})
class MockColorPickerEditComponent {
  public readonly formField = input<unknown>();
  public readonly title = input('');
}

describe('LineEditComponent', () => {
  let component: LineEditComponent;
  let fixture: ComponentFixture<LineEditComponent>;
  let compiled: HTMLElement;

  const lineStyle = signal<Gb3LineStringStyle>({
    strokeOpacity: 1,
    strokeWidth: 1,
    strokeColor: '#ff0000',
    type: 'line',
  });

  beforeEach(async () => {
    lineStyle.set({
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeColor: '#ff0000',
      type: 'line',
    });

    await TestBed.configureTestingModule({
      imports: [LineEditComponent],
    })
      .overrideComponent(LineEditComponent, {
        remove: {
          imports: [SliderEditComponent, ColorPickerEditComponent],
        },
        add: {
          imports: [MockSliderEditComponent, MockColorPickerEditComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LineEditComponent, {
      bindings: [twoWayBinding('lineStyle', lineStyle)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the section heading', () => {
    const heading = compiled.querySelector('h3');

    expect(heading?.textContent?.trim()).toBe('Umrandung');
  });

  it('should render the slider controls with the correct configuration', () => {
    const sliders = fixture.debugElement.queryAll((debugElement) => debugElement.componentInstance instanceof MockSliderEditComponent);

    expect(sliders).toHaveLength(2);

    const [widthSlider, opacitySlider] = sliders.map((debugElement) => debugElement.componentInstance as MockSliderEditComponent);

    expect(widthSlider.title()).toBe('Strichstärke');
    expect(widthSlider.minValue()).toBe(1);
    expect(widthSlider.maxValue()).toBe(12);
    expect(widthSlider.step()).toBe(1);
    expect(widthSlider.formField()).toBe(component.lineStyleForm.strokeWidth);

    expect(opacitySlider.title()).toBe('Deckkraft');
    expect(opacitySlider.minValue()).toBeUndefined();
    expect(opacitySlider.maxValue()).toBeUndefined();
    expect(opacitySlider.step()).toBeUndefined();
    expect(opacitySlider.formField()).toBe(component.lineStyleForm.strokeOpacity);
  });

  it('should render the color picker with the correct configuration', () => {
    const colorPicker = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof MockColorPickerEditComponent,
    );

    const colorPickerComponent = colorPicker.componentInstance as MockColorPickerEditComponent;

    expect(colorPickerComponent.title()).toBe('Strichfarbe');
    expect(colorPickerComponent.formField()).toBe(component.lineStyleForm.strokeColor);
  });

  it('should expose the current line style through the form model', () => {
    expect(component.lineStyleFormModel()).toEqual({
      strokeOpacity: 1,
      strokeWidth: 1,
      strokeColor: '#ff0000',
      type: 'line',
    });
  });

  it('should update the form model when the bound line style changes', () => {
    lineStyle.set({
      strokeOpacity: 0.5,
      strokeWidth: 7,
      strokeColor: '#00ff00',
      type: 'line',
    });
    fixture.detectChanges();

    expect(component.lineStyleFormModel()).toEqual({
      strokeOpacity: 0.5,
      strokeWidth: 7,
      strokeColor: '#00ff00',
      type: 'line',
    });
  });

  it('should preserve all values from the bound line style', () => {
    const updatedStyle: Gb3LineStringStyle = {
      strokeOpacity: 0.25,
      strokeWidth: 10,
      strokeColor: '#123456',
      type: 'line',
    };

    lineStyle.set(updatedStyle);
    fixture.detectChanges();

    expect(component.lineStyleFormModel()).toEqual(updatedStyle);
    expect(lineStyle()).toEqual(updatedStyle);
  });

  it('should synchronize changes made to the form model back to the bound line style', () => {
    component.lineStyleFormModel.set({
      strokeOpacity: 0.4,
      strokeWidth: 5,
      strokeColor: '#abcdef',
      type: 'line',
    });
    fixture.detectChanges();

    expect(lineStyle()).toEqual({
      strokeOpacity: 0.4,
      strokeWidth: 5,
      strokeColor: '#abcdef',
      type: 'line',
    });
  });

  it('should not replace the bound line style when the form model and line style are equal', () => {
    const initialStyle: Gb3LineStringStyle = {
      strokeOpacity: 0.75,
      strokeWidth: 3,
      strokeColor: '#654321',
      type: 'line',
    };

    lineStyle.set(initialStyle);
    fixture.detectChanges();

    expect(lineStyle()).toEqual(initialStyle);

    component.lineStyleFormModel.set(initialStyle);
    fixture.detectChanges();

    expect(lineStyle()).toEqual(initialStyle);
  });

  it('should update the rendered form field bindings after the line style changes', () => {
    lineStyle.set({
      strokeOpacity: 0.2,
      strokeWidth: 8,
      strokeColor: '#112233',
      type: 'line',
    });
    fixture.detectChanges();

    const sliders = fixture.debugElement.queryAll((debugElement) => debugElement.componentInstance instanceof MockSliderEditComponent);

    const colorPicker = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof MockColorPickerEditComponent,
    );

    expect(sliders[0].componentInstance.formField()).toBe(component.lineStyleForm.strokeWidth);
    expect(sliders[1].componentInstance.formField()).toBe(component.lineStyleForm.strokeOpacity);
    expect(colorPicker.componentInstance.formField()).toBe(component.lineStyleForm.strokeColor);
  });
});
