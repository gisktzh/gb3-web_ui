import {Component, Input} from '@angular/core';
import {LegendDisplay} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss'],
})
export class LegendItemComponent {
  @Input() public legendItem!: LegendDisplay;
  /** A value indicating whether interactive elements (like buttons) should be shown. [Default: true] */
  @Input() public showInteractiveElements: boolean = true;
  public readonly staticFilesBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.staticFilesBaseUrl = this.configService.apiConfig.gb2StaticFiles.baseUrl;
  }
}
