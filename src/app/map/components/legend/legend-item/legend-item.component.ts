import {Component, Input} from '@angular/core';
import {LegendDisplay} from '../../../../shared/interfaces/legend.interface';
import {ConfigService} from '../../../../shared/services/config.service';

@Component({
  selector: 'legend-item',
  templateUrl: './legend-item.component.html',
  styleUrls: ['./legend-item.component.scss']
})
export class LegendItemComponent {
  @Input() public legendItem!: LegendDisplay;
  @Input() public isPrintable: boolean = false;
  public readonly staticFilesBaseUrl: string;

  private readonly dataTabUrl = '/data/geodata';

  constructor(private readonly configService: ConfigService) {
    this.staticFilesBaseUrl = configService.apiConfig.gb2StaticFiles.baseUrl;
  }

  public getDataTabLink(id: number): string {
    return `${this.dataTabUrl}/${id}`;
  }
}
