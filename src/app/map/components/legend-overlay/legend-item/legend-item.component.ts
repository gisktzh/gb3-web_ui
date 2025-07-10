import {Component, Input, inject} from '@angular/core';
import {LegendDisplay} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss'],
  standalone: false,
})
export class LegendItemComponent {
  private readonly configService = inject(ConfigService);

  @Input() public legendItem!: LegendDisplay;
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;
  public readonly staticFilesBaseUrl: string;

  constructor() {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }
}
