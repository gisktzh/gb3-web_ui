import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {ContentLoadingStateComponent} from './components/content-loading-state/content-loading-state.component';
import {DiscoverMapsComponent} from './components/discover-maps/discover-maps.component';
import {FrequentlyUsedItemsComponent} from './components/frequently-used-items/frequently-used-items.component';
import {GisBrowserTeaserComponent} from './components/gis-browser-teaser/gis-browser-teaser.component';
import {NewsFeedComponent} from './components/news-feed/news-feed.component';
import {SearchResultEntryDataCatalogComponent} from './components/start-page-search/search-result-entry-data-catalog/search-result-entry-data-catalog.component';
import {SearchResultEntryMapComponent} from './components/start-page-search/search-result-entry-map/search-result-entry-map.component';
import {SearchResultEntrySupportComponent} from './components/start-page-search/search-result-entry-support/search-result-entry-support.component';
import {SearchResultGroupComponent} from './components/start-page-search/search-result-group/search-result-group.component';
import {SearchResultGroupsComponent} from './components/start-page-search/search-result-groups/search-result-groups.component';
import {StartPageSearchComponent} from './components/start-page-search/start-page-search.component';
import {TwitterFeedComponent} from './components/twitter-feed/twitter-feed.component';
import {StartPageRoutingModule} from './start-page-routing.module';
import {StartPageComponent} from './start-page.component';

@NgModule({
  declarations: [
    StartPageComponent,
    TwitterFeedComponent,
    NewsFeedComponent,
    DiscoverMapsComponent,
    ContentLoadingStateComponent,
    GisBrowserTeaserComponent,
    FrequentlyUsedItemsComponent,
    StartPageSearchComponent,
    SearchResultGroupComponent,
    SearchResultEntryMapComponent,
    SearchResultEntryDataCatalogComponent,
    SearchResultEntrySupportComponent,
    SearchResultGroupsComponent,
  ],
  imports: [CommonModule, SharedModule, StartPageRoutingModule],
})
export class StartPageModule {}
