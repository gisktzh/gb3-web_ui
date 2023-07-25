import {Component, Input} from '@angular/core';
import {DataDisplayElement} from '../../types/data-display-element';

@Component({
  selector: 'data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent {
  @Input() public elements: DataDisplayElement[] = [];
}
