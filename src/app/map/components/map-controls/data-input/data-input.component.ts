import {Component, input, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'data-input',
  templateUrl: './data-input.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./data-input.component.scss'],
})
export class DataInputComponent {
  public readonly prefix = input<string>();
}
