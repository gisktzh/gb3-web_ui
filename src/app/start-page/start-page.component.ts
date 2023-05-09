import {Component} from '@angular/core';
import {ConfigService} from '../shared/services/config.service';
import {TitleLink} from './components/start-page-section/start-page-section.component';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent {
  public readonly apiConfigs = this.configService.apiConfig;
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge'
  };

  constructor(private readonly configService: ConfigService) {}
}
