import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BaseMapDataItemComponent} from '../base-map-data-item/base-map-data-item.component';
import {LoadingState} from '../../../../shared/types/loading-state';

const FAVOURITE_ERROR_TOOLTIP =
  'Der Favorit kann nicht angezeigt werden. Dies kann verschiedene Gründe haben - z.B. existiert eine (' +
  'oder mehrere) Karten innerhalb des Favorits nicht mehr.';

@Component({
  selector: 'map-data-item-favourite',
  templateUrl: '../base-map-data-item/base-map-data-item.component.html',
  styleUrls: ['../base-map-data-item/base-map-data-item.component.scss']
})
export class MapDataItemFavouriteComponent extends BaseMapDataItemComponent {
  @Input() public override loadingState: LoadingState = 'undefined';
  @Input() public override invalid?: boolean;

  @Output() public override deleteEvent = new EventEmitter<void>();

  public override showDeleteButton = true;
  public override errorTooltip: string = FAVOURITE_ERROR_TOOLTIP;
}
