import {Component, input, model} from '@angular/core';
import {SliderWrapperComponent} from '../../../../../shared/components/slider-wrapper/slider-wrapper.component';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'slider-edit',
  templateUrl: './slider-edit.component.html',
  styleUrl: './slider-edit.component.scss',
  imports: [SliderWrapperComponent, MatSlider, MatSliderThumb, FormsModule],
})
export class SliderEditComponent {
  public readonly value = model<number | string>(0);
  public readonly minValue = input(0);
  public readonly maxValue = input(1);
  public readonly step = input(0.01);
  public readonly title = input('');
  public readonly showLineWidth = input(false);
}
