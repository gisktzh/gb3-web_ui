import {Component, input} from '@angular/core';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'slider-wrapper',
  templateUrl: './slider-wrapper.component.html',
  styleUrls: ['./slider-wrapper.component.scss'],
  imports: [MatTooltip, MatIcon],
})
export class SliderWrapperComponent<T> {
  /** The title of the slider wrapper */
  public title = input.required<string>();
  /** An optional description; will be shown as tooltip on top of an info icon */
  public description = input<string | null>();
  /** The current value */
  public value = input.required<T>();
  /** The maximum value */
  public maxValue = input.required<T>();
  /** The minimum value */
  public minValue = input.required<T>();

  public overwriteHeader = input(false);
  public overwriteFooter = input(false);
}
