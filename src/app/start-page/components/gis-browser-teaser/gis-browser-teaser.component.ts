import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MainPage} from 'src/app/shared/enums/main-page.enum';

@Component({
  selector: 'gis-browser-teaser',
  templateUrl: './gis-browser-teaser.component.html',
  styleUrls: ['./gis-browser-teaser.component.scss'],
  imports: [RouterLink],
})
export class GisBrowserTeaserComponent {
  protected readonly mainPageEnum = MainPage;
}
