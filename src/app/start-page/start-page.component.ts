import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {TitleLink, PageSectionComponent} from '../shared/components/page-section/page-section.component';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectAdditionalInformationLinks} from '../state/support/reducers/support-content.reducer';
import {HeroHeaderComponent} from '../shared/components/hero-header/hero-header.component';
import {StartPageSearchComponent} from './components/start-page-search/start-page-search.component';
import {GisBrowserTeaserComponent} from './components/gis-browser-teaser/gis-browser-teaser.component';
import {FrequentlyUsedItemsComponent} from './components/frequently-used-items/frequently-used-items.component';
import {NewsFeedComponent} from './components/news-feed/news-feed.component';
import {DiscoverMapsComponent} from './components/discover-maps/discover-maps.component';
import {LinkListComponent} from '../shared/components/lists/link-list/link-list.component';

const START_PAGE_SUMMARY =
  'Willkommen auf dem Geoportal, dem zentralen Einstiegspunkt zu den Geoinformationen des Kantons Zürich. Über verschiedene Auskunftssysteme und Anwendungen können Sie Geodaten finden, anschauen, herunterladen oder bestellen.';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
  imports: [
    PageSectionComponent,
    HeroHeaderComponent,
    StartPageSearchComponent,
    GisBrowserTeaserComponent,
    FrequentlyUsedItemsComponent,
    NewsFeedComponent,
    DiscoverMapsComponent,
    LinkListComponent,
  ],
})
export class StartPageComponent {
  private readonly store = inject(Store);

  public heroText = START_PAGE_SUMMARY;
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge',
  };
  public readonly additionalInformationLinksGroups = this.store.selectSignal(selectAdditionalInformationLinks);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
