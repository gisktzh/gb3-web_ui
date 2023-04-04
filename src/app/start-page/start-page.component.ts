import {Component} from '@angular/core';
import {environment} from '../../environments/environment';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent {
  public readonly apiConfigs = environment.apiConfigs;
}
