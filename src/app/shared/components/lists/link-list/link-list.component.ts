import {Component, Input} from '@angular/core';
import {LinksGroup} from '../../../interfaces/links-group.interface';

@Component({
  selector: 'link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss'],
  standalone: false,
})
export class LinkListComponent {
  @Input() public linksGroups: LinksGroup[] = [];
}
