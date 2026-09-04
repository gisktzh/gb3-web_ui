import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {By} from '@angular/platform-browser';
import {SliderEditComponent} from './slider-edit.component';
import {SliderWrapperComponent} from '../../../../../shared/components/slider-wrapper/slider-wrapper.component';
import {MatSlider} from '@angular/material/slider';

describe('SliderEditComponent', () => {
  let component: SliderEditComponent;
  let fixture: ComponentFixture<SliderEditComponent>;
  let compiled: HTMLElement;

  const value = signal<number | string>(25);
  const minValue = signal(0);
  const maxValue = signal(100);
  const step = signal(5);
  const title = signal('Test slider');
  const showLineWidth = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SliderEditComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderEditComponent, {
      bindings: [
        twoWayBinding('value', value),
        inputBinding('minValue', minValue),
        inputBinding('maxValue', maxValue),
        inputBinding('step', step),
        inputBinding('title', title),
        inputBinding('showLineWidth', showLineWidth),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the configured inputs to the slider', () => {
    const slider = fixture.debugElement.query(By.directive(MatSlider)).componentInstance;

    expect(slider.min).toBe(0);
    expect(slider.max).toBe(100);
    expect(slider.step).toBe(5);
  });

  it('should render the slider thumb with the bound value', () => {
    const sliderThumb = fixture.debugElement.query(By.css('input[matSliderThumb]'));

    expect(sliderThumb).toBeTruthy();
    expect(sliderThumb.nativeElement.value).toBe('25');
  });

  it('should pass the title to the slider wrapper', () => {
    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(sliderWrapper).toBeTruthy();
    expect(sliderWrapper.componentInstance.title()).toBe('Test slider');
  });

  it('should pass the value to the slider wrapper', () => {
    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(sliderWrapper).toBeTruthy();
    expect(sliderWrapper.componentInstance.value()).toBe(25);
  });

  it('should pass min and max values to the slider wrapper', () => {
    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(sliderWrapper.componentInstance.minValue()).toBe(0);
    expect(sliderWrapper.componentInstance.maxValue()).toBe(100);
  });

  it('should always overwrite the wrapper footer', () => {
    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(sliderWrapper.componentInstance.overwriteFooter()).toBe(true);
  });

  it('should not render the line width footer by default', () => {
    expect(compiled.querySelector('.slider-edit__footer')).toBeNull();
  });

  it('should render the line width footer when enabled', () => {
    showLineWidth.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.slider-edit__footer')).toBeTruthy();
    expect(compiled.querySelector('.slider-edit__footer__min')).toBeTruthy();
    expect(compiled.querySelector('.slider-edit__footer__max')).toBeTruthy();
  });

  it('should update the slider when the input values change', () => {
    minValue.set(10);
    maxValue.set(200);
    step.set(10);
    value.set(80);

    fixture.detectChanges();

    const slider = fixture.debugElement.query(By.directive(MatSlider)).componentInstance;

    expect(slider.min).toBe(10);
    expect(slider.max).toBe(200);
    expect(slider.step).toBe(10);
  });

  it('should update the slider wrapper when the inputs change', () => {
    title.set('Updated title');
    minValue.set(10);
    maxValue.set(200);
    value.set(75);

    fixture.detectChanges();

    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(sliderWrapper.componentInstance.title()).toBe('Updated title');
    expect(sliderWrapper.componentInstance.value()).toBe(75);
    expect(sliderWrapper.componentInstance.minValue()).toBe(10);
    expect(sliderWrapper.componentInstance.maxValue()).toBe(200);
  });

  it('should update the bound value when the slider thumb changes', async () => {
    const sliderThumb = fixture.debugElement.query(By.css('input[matSliderThumb]'));

    sliderThumb.nativeElement.value = '60';
    sliderThumb.nativeElement.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(value()).toBe(60);
  });

  it('should support string values', () => {
    value.set('42');
    fixture.detectChanges();

    const sliderWrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent));

    expect(component.value()).toBe('42');
    expect(sliderWrapper.componentInstance.value()).toBe('42');
  });

  it('should use the default component input values when they are not overridden', () => {
    const defaultFixture = TestBed.createComponent(SliderEditComponent, {
      bindings: [twoWayBinding('value', signal<number | string>(0))],
    });

    defaultFixture.detectChanges();

    const defaultComponent = defaultFixture.componentInstance;

    expect(defaultComponent.minValue()).toBe(0);
    expect(defaultComponent.maxValue()).toBe(1);
    expect(defaultComponent.step()).toBe(0.01);
    expect(defaultComponent.title()).toBe('');
    expect(defaultComponent.showLineWidth()).toBe(false);
  });
});
