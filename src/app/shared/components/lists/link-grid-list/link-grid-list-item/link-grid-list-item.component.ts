import {Component, Input} from '@angular/core';

@Component({
  selector: 'link-grid-list-item',
  templateUrl: './link-grid-list-item.component.html',
  styleUrls: ['./link-grid-list-item.component.scss'],
})
export class LinkGridListItemComponent {
  @Input() public title!: string;
  @Input() public url!: string;
  @Input() public entryType?: string;
  @Input() public entryDate?: string;
}
