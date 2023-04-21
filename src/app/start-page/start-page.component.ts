import {Component} from '@angular/core';
import {ConfigService} from '../shared/services/config.service';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent {
  public readonly apiConfigs = this.configService.apiConfig;

  constructor(private readonly configService: ConfigService) {}
}
