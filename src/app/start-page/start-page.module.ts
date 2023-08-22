import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {StartPageRoutingModule} from './start-page-routing.module';
import {StartPageComponent} from './start-page.component';
import {TwitterFeedComponent} from './components/twitter-feed/twitter-feed.component';
import {NewsFeedComponent} from './components/news-feed/news-feed.component';
import {DiscoverMapsComponent} from './components/discover-maps/discover-maps.component';
import {ContentLoadingStateComponent} from './components/content-loading-state/content-loading-state.component';
import {StartPagePlaceholderComponent} from './components/start-page-placeholder/start-page-placeholder.component';
import {GisBrowserTeaserComponent} from './components/gis-browser-teaser/gis-browser-teaser.component';
import {FrequentlyUsedItemsComponent} from './components/frequently-used-items/frequently-used-items.component';
import {StartPageSearchOverlayComponent} from './components/start-page-search-overlay/start-page-search-overlay.component';
import {MapModule} from '../map/map.module';
import {SearchResultGroupComponent} from './components/search-result-group/search-result-group.component';

@NgModule({
  declarations: [
    StartPageComponent,
    TwitterFeedComponent,
    NewsFeedComponent,
    DiscoverMapsComponent,
    ContentLoadingStateComponent,
    StartPagePlaceholderComponent,
    GisBrowserTeaserComponent,
    FrequentlyUsedItemsComponent,
    StartPageSearchOverlayComponent,
    SearchResultGroupComponent,
  ],
  imports: [CommonModule, SharedModule, StartPageRoutingModule, MapModule],
  exports: [],
})
export class StartPageModule {}
