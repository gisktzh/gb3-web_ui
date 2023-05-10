import {Component, Input} from '@angular/core';
import {LoadingState} from '../../../../shared/types/loading-state';

@Component({
  selector: 'map-data-item-header',
  templateUrl: './map-data-item-header.component.html',
  styleUrls: ['./map-data-item-header.component.scss']
})
export class MapDataItemHeaderComponent {
  @Input() public title!: string;
  @Input() public filterString: string = '';
  @Input() public isExpanded: boolean = true;
  @Input() public loadingState: LoadingState = 'undefined';
  @Input() public numberOfItems: number = 0;
}
