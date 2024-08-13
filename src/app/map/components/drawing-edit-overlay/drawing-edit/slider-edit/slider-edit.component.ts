import {Component, EventEmitter, Input, numberAttribute, Output} from '@angular/core';

@Component({
  selector: 'slider-edit',
  templateUrl: './slider-edit.component.html',
  styleUrl: './slider-edit.component.scss',
})
export class SliderEditComponent {
  @Input({transform: numberAttribute}) public sliderValue: number = 0;
  @Input() public min: number = 0;
  @Input() public max: number = 1;
  @Input() public step: number = 0.01;
  @Input() public title: string = '';
  @Input() public showLineWidth: boolean = false;

  @Output() public updateSliderEvent = new EventEmitter<number>();

  public updateSlider() {
    this.updateSliderEvent.emit(this.sliderValue);
  }
}
