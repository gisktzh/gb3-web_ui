import {Component, Input} from '@angular/core';
import {LinkObject} from '../../../../interfaces/link-object.interface';

@Component({
  selector: 'link-list-item',
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.scss'],
  standalone: false,
})
export class LinkListItemComponent {
  @Input() public links: LinkObject[] = [];
}
