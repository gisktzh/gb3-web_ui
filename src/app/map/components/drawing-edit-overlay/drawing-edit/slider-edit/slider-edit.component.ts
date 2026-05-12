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
  public value = model<number | string>(0);
  public minValue = input(0);
  public maxValue = input(1);
  public step = input(0.01);
  public title = input('');
  public showLineWidth = input(false);
}
