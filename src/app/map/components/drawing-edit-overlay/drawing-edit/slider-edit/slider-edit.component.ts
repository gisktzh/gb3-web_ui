import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'slider-edit',
  templateUrl: './slider-edit.component.html',
  styleUrl: './slider-edit.component.scss',
})
export class SliderEditComponent {
  @Input() public sliderValue: number = 0;
  @Input() public min: number = 0;
  @Input() public max: number = 1;
  @Input() public step: number = 0.01;
  @Input() public title: string = '';

  @Output() public updateValue = new EventEmitter<number>();
}
