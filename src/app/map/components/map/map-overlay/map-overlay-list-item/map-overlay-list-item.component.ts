import {Component, Input} from '@angular/core';

@Component({
  selector: 'map-overlay-list-item',
  templateUrl: './map-overlay-list-item.component.html',
  styleUrls: ['./map-overlay-list-item.component.scss']
})
export class MapOverlayListItemComponent {
  @Input() public title: string = '';
}
