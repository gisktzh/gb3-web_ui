import {Component, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {Layer} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-content',
  templateUrl: './legend-content.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./legend-content.component.scss'],
})
export class LegendContentComponent {
  public readonly layer = input.required<Layer>();
  public readonly staticFilesBaseUrl = inject(ConfigService).apiConfig.gb2StaticFiles.baseUrl;
}
