import {Component, Input} from '@angular/core';
import {LinkObject} from '../../../../interfaces/link-object.interface';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'link-list-item',
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.scss'],
  imports: [MatIcon],
})
export class LinkListItemComponent {
  @Input() public links: LinkObject[] = [];
}
