import {Component, Input} from '@angular/core';

@Component({
  selector: 'data-input',
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss'],
  standalone: false,
})
export class DataInputComponent {
  @Input() public prefix?: string;
}
