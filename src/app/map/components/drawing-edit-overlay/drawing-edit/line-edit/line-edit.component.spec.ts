import {Component, input, signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Gb3LineStringStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {LineEditComponent} from './line-edit.component';

@Component({selector: 'slider-edit', template: ''})
class SliderStubComponent {
  public readonly formField = input<unknown>();
  public readonly minValue = input<number>();
  public readonly maxValue = input<number>();
  public readonly step = input<number>();
  public readonly title = input('');
}

@Component({selector: 'color-picker-edit', template: ''})
class ColorPickerStubComponent {
  public readonly formField = input<unknown>();
  public readonly title = input('');
}

describe('LineEditComponent', () => {
  let fixture: ComponentFixture<LineEditComponent>;
  const style = signal<Gb3LineStringStyle>({
    type: 'line',
    strokeWidth: 2,
    strokeOpacity: 0.8,
    strokeColor: '#123456',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [LineEditComponent]})
      .overrideComponent(LineEditComponent, {
        remove: {imports: [SliderEditComponent, ColorPickerEditComponent]},
        add: {imports: [SliderStubComponent, ColorPickerStubComponent]},
      })
      .compileComponents();
    fixture = TestBed.createComponent(LineEditComponent, {bindings: [twoWayBinding('lineStyle', style)]});
    fixture.detectChanges();
  });

  it('wires the line controls to the expected fields', () => {
    const sliders = fixture.debugElement.children.filter((child) => child.componentInstance instanceof SliderStubComponent);
    const picker = fixture.debugElement.children.find((child) => child.componentInstance instanceof ColorPickerStubComponent);

    expect(sliders.map(({componentInstance}) => componentInstance.title())).toEqual(['Strichstärke', 'Deckkraft']);
    expect(sliders[0].componentInstance.formField()).toBe(fixture.componentInstance.lineStyleForm.strokeWidth);
    expect(picker?.componentInstance.title()).toBe('Strichfarbe');
  });

  it('publishes form-model changes through the two-way style binding', () => {
    fixture.componentInstance.lineStyleFormModel.set({...style(), strokeWidth: 7});
    fixture.detectChanges();

    expect(style().strokeWidth).toBe(7);
  });
});
