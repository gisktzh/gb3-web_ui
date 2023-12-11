import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ExternalServiceActiveMapItem} from '../../../../models/external-service.model';

@Component({
  selector: 'map-import-layer-list',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './map-import-layer-list.component.html',
  styleUrl: './map-import-layer-list.component.scss',
})
export class MapImportLayerListComponent {
  @Input() public temporaryExternalMapItem!: ExternalServiceActiveMapItem;
}
