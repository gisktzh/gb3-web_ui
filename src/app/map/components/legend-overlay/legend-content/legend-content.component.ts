import {Component, Input} from '@angular/core';
import {Layer} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-content',
  templateUrl: './legend-content.component.html',
  styleUrls: ['./legend-content.component.scss'],
})
export class LegendContentComponent {
  @Input() public layer!: Layer;
  public readonly staticFilesBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.staticFilesBaseUrl = configService.apiConfig.gb2StaticFiles.baseUrl;
  }
}
