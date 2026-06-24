import {Component, input} from '@angular/core';

@Component({
  selector: 'data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss'],
})
export class DataInputComponent {
  public readonly prefix = input<string>();
}
