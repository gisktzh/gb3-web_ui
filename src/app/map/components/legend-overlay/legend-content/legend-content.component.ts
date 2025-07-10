import {Component, Input, inject} from '@angular/core';
import {Layer} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-content',
  templateUrl: './legend-content.component.html',
  styleUrls: ['./legend-content.component.scss'],
  standalone: false,
})
export class LegendContentComponent {
  private readonly configService = inject(ConfigService);

  @Input() public layer!: Layer;
  public readonly staticFilesBaseUrl: string;

  constructor() {
    const configService = this.configService;

    this.staticFilesBaseUrl = configService.apiConfig.gb2StaticFiles.baseUrl;
  }
}
