import {Component, input} from '@angular/core';
import {LinksGroup} from '../../../interfaces/links-group.interface';
import {LinkListItemComponent} from './link-list-item/link-list-item.component';

@Component({
  selector: 'link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss'],
  imports: [LinkListItemComponent],
})
export class LinkListComponent {
  public readonly linksGroups = input<LinksGroup[]>([]);
}
