import {Component, Input} from '@angular/core';

@Component({
  selector: 'slider-wrapper',
  templateUrl: './slider-wrapper.component.html',
  styleUrls: ['./slider-wrapper.component.scss'],
})
export class SliderWrapperComponent<T> {
  /** The title of the slider wrapper */
  @Input() public title!: string;
  /** An optional description; will be shown as tooltip on top of an info icon */
  @Input() public description?: string;
  /** The current value */
  @Input() public value!: T;
  /** The maximum value */
  @Input() public maxValue!: T;
  /** The minimum value */
  @Input() public minValue!: T;

  @Input() public overwriteHeader: boolean = false;
  @Input() public overwriteFooter: boolean = false;
}
