import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ktzh-slider-wrapper',
  templateUrl: './ktzh-slider-wrapper.component.html',
  styleUrls: ['./ktzh-slider-wrapper.component.scss']
})
export class KtzhSliderWrapperComponent<T> implements OnInit {
  /** The title of the slider wrapper */
  @Input() public title!: string;
  /** An optional description; will be shown as tooltip on top of an info icon */
  @Input() public description?: string;
  /** The current value; optional only if the `complexValue` is set instead. */
  @Input() public value?: T;
  /**
   * The current complex value formatted as string; only used if `value` isn't set.
   *
   * @remarks
   * The complex value is of type 'string' due to its nature; it can contain multiple values instead of containing only one value of type `T`
   * An example would be a range slider containing two current values.
   * */
  @Input() public complexValue?: string;
  /** The maximum value */
  @Input() public maxValue!: T;
  /** The minimum value */
  @Input() public minValue!: T;

  /** An optional function to convert the current, maximum and minimum value from their current type `T` to string */
  @Input() public displayWith?: (value?: T, format?: string) => string;

  @Input() public overwriteHeader: boolean = false;
  @Input() public overwriteFooter: boolean = false;

  public hasSimpleValue: boolean = true;

  public ngOnInit(): void {
    this.hasSimpleValue = this.value !== undefined;
  }
}
