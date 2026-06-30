import {Component, input} from '@angular/core';
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
  public readonly reportUrl = input.required<string>();
  public readonly reportDescription = input<string | null | undefined>();
}
