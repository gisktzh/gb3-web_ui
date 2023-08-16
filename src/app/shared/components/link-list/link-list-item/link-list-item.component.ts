import {Component, Input} from '@angular/core';
import {LinkableElement} from '../../../interfaces/linkable-element.interface';

@Component({
  selector: 'link-list-item',
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.scss'],
})
export class LinkListItemComponent {
  @Input() public links: LinkableElement[] = [];
}
