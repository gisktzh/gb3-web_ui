import {Component, Input} from '@angular/core';
import {DataDisplayElement} from '../../types/data-display-element.type';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'data-display',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent {
  @Input() public elements: DataDisplayElement[] = [];
}
