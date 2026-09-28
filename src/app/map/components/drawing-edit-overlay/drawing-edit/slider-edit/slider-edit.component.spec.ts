import {inputBinding, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatSlider} from '@angular/material/slider';
import {SliderWrapperComponent} from '../../../../../shared/components/slider-wrapper/slider-wrapper.component';
import {SliderEditComponent} from './slider-edit.component';

describe('SliderEditComponent', () => {
  let fixture: ComponentFixture<SliderEditComponent>;
  const value = signal<number | string>(25);
  const showLineWidth = signal(false);

  beforeEach(async () => {
    value.set(25);
    showLineWidth.set(false);
    await TestBed.configureTestingModule({imports: [SliderEditComponent]}).compileComponents();
    fixture = TestBed.createComponent(SliderEditComponent, {
      bindings: [
        twoWayBinding('value', value),
        inputBinding('minValue', () => 10),
        inputBinding('maxValue', () => 50),
        inputBinding('step', () => 5),
        inputBinding('title', () => 'Breite'),
        inputBinding('showLineWidth', showLineWidth),
      ],
    });
    fixture.detectChanges();
  });

  it('configures the slider and its value summary', () => {
    const slider = fixture.debugElement.query(By.directive(MatSlider)).componentInstance;
    const wrapper = fixture.debugElement.query(By.directive(SliderWrapperComponent)).componentInstance;

    expect({min: slider.min, max: slider.max, step: slider.step}).toEqual({min: 10, max: 50, step: 5});
    expect(wrapper.title()).toBe('Breite');
    expect(wrapper.value()).toBe(25);
  });

  it('updates the bound value from the slider thumb', async () => {
    const thumb = fixture.nativeElement.querySelector('input[matSliderThumb]') as HTMLInputElement;
    thumb.value = '40';
    thumb.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(value()).toBe(40);
  });

  it('only renders the line-width footer when requested', () => {
    expect(fixture.nativeElement.querySelector('.slider-edit__footer')).toBeNull();

    showLineWidth.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.slider-edit__footer')).not.toBeNull();
  });
});
