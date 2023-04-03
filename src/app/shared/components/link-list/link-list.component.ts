import {Component, Input} from '@angular/core';
import {LinkableElement} from '../../interfaces/linkable-element.interface';

@Component({
  selector: 'link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent {
  @Input() public links: LinkableElement[] = [];
}
