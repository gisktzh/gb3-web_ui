import {Component, Input} from '@angular/core';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'feature-info-report-download',
  templateUrl: './feature-info-report-download.component.html',
  styleUrls: ['./feature-info-report-download.component.scss'],
  imports: [MapOverlayListItemComponent, MatButton, MatIcon],
})
export class FeatureInfoReportDownloadComponent {
  @Input() public reportUrl!: string;
  @Input() public reportDescription!: string | null;
}
