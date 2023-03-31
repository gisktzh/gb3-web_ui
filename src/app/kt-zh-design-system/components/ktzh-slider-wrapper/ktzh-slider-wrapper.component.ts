import {Component, Input} from '@angular/core';

@Component({
  selector: 'ktzh-slider-wrapper',
  templateUrl: './ktzh-slider-wrapper.component.html',
  styleUrls: ['./ktzh-slider-wrapper.component.scss']
})
export class KtzhSliderWrapperComponent {
  @Input() public title?: string;
  @Input() public value?: number;
  @Input() public maxValue?: number;
  @Input() public minValue?: number;

  @Input() public displayWith?: (value?: number) => string;
}
