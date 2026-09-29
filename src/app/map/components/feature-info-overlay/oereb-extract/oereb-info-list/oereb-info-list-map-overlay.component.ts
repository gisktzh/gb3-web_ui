import {Component, input} from '@angular/core';
import {OerebExtractListListItem} from 'src/app/map/types/oereb-extract-list-item.type';
import {MapOverlayListItemComponent} from '../../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {OerebInfoValueComponent} from '../oereb-info-value/oereb-info-value.component';

@Component({
  selector: 'oereb-info-list-map-overlay',
  templateUrl: './oereb-info-list-map-overlay.component.html',
  styleUrls: ['./oereb-info-list-map-overlay.component.scss'],
  imports: [MapOverlayListItemComponent, OerebInfoValueComponent],
})
export class OerebInfoListMapOverlayComponent {
  public readonly listItem = input.required<OerebExtractListListItem>();
}
