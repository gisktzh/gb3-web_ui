import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, input, inputBinding, signal} from '@angular/core';
import {PointEditComponent} from './point-edit.component';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'slider-edit',
  template: '',
})
class MockSliderEditComponent {
  public readonly formField = input<unknown>();
  public readonly minValue = input<number>();
  public readonly maxValue = input<number>();
  public readonly step = input<number>();
  public readonly title = input<string>();
}

@Component({
  selector: 'color-picker-edit',
  template: '',
})
class MockColorPickerEditComponent {
  public readonly formField = input<unknown>();
  public readonly title = input<string>();
}

describe('PointEditComponent', () => {
  let component: PointEditComponent;
  let fixture: ComponentFixture<PointEditComponent>;
  let compiled: HTMLElement;

  const pointStyle = signal<Gb3PointStyle>({
    strokeWidth: 3,
    strokeOpacity: 0.5,
    strokeColor: '#123456',
    fillOpacity: 0.75,
    fillColor: '#abcdef',
    pointRadius: 10,
    type: 'point',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointEditComponent],
    })
      .overrideComponent(PointEditComponent, {
        remove: {
          imports: [SliderEditComponent, ColorPickerEditComponent],
        },
        add: {
          imports: [MockSliderEditComponent, MockColorPickerEditComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PointEditComponent, {
      bindings: [inputBinding('pointStyle', pointStyle)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all section headings', () => {
    const headings = Array.from(compiled.querySelectorAll('h3'));

    expect(headings.map((heading) => heading.textContent?.trim())).toEqual(['Umrandung', 'Füllung', 'Grösse']);
  });

  it('should render the expected number of dividers', () => {
    expect(compiled.querySelectorAll('mat-divider').length).toBe(2);
  });

  it('should configure the stroke width slider', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(MockSliderEditComponent));
    const slider = sliders[0].componentInstance;

    expect(slider.minValue()).toBe(1);
    expect(slider.maxValue()).toBe(12);
    expect(slider.step()).toBe(1);
    expect(slider.title()).toBe('Strichstärke');
  });

  it('should configure the stroke opacity slider', () => {
    const sliders = compiled.querySelectorAll('slider-edit');
    const slider = sliders[1] as HTMLElement & {
      title: string;
    };

    expect(slider.title).toBe('Deckkraft');
  });

  it('should configure the stroke color picker', () => {
    const colorPickers = compiled.querySelectorAll('color-picker-edit');
    const colorPicker = colorPickers[0] as HTMLElement & {
      title: string;
    };

    expect(colorPicker.title).toBe('Strichfarbe');
  });

  it('should configure the fill opacity slider', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(MockSliderEditComponent));
    const slider = sliders[2].componentInstance;
    expect(slider.title()).toBe('Deckkraft');
  });

  it('should configure the fill color picker', () => {
    const colorPickers = compiled.querySelectorAll('color-picker-edit');
    const colorPicker = colorPickers[1] as HTMLElement & {
      title: string;
    };

    expect(colorPicker.title).toBe('Füllfarbe');
  });

  it('should configure the point radius slider', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(MockSliderEditComponent));
    const slider = sliders[3].componentInstance;

    expect(slider.minValue()).toBe(1);
    expect(slider.maxValue()).toBe(50);
    expect(slider.step()).toBe(1);
    expect(slider.title()).toBe('Radius');
  });

  it('should preserve all supplied point style values in the form model', () => {
    expect(component.pointStyleFormModel()).toEqual(pointStyle());
  });

  it('should add default values when the external point style is only partially defined', () => {
    pointStyle.set({
      strokeWidth: 5,
      strokeOpacity: 0.25,
      strokeColor: '#111111',
      fillOpacity: 0.5,
      fillColor: '#222222',
      pointRadius: 20,
      type: 'point',
    });

    fixture.detectChanges();

    expect(component.pointStyleFormModel()).toEqual({
      strokeWidth: 5,
      strokeOpacity: 0.25,
      strokeColor: '#111111',
      fillOpacity: 0.5,
      fillColor: '#222222',
      pointRadius: 20,
      type: 'point',
    });
  });

  it('should update the form model when the externally bound point style changes', () => {
    pointStyle.set({
      strokeWidth: 8,
      strokeOpacity: 0.2,
      strokeColor: '#654321',
      fillOpacity: 0.6,
      fillColor: '#fedcba',
      pointRadius: 35,
      type: 'point',
    });

    fixture.detectChanges();

    expect(component.pointStyleFormModel()).toEqual(pointStyle());
  });
});
