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
import {KtZhDesignSystemModule} from '../kt-zh-design-system/kt-zh-design-system.module';
import {GisBrowserTeaserComponent} from './components/gis-browser-teaser/gis-browser-teaser.component';
import {FrequentlyUsedItemsComponent} from './components/frequently-used-items/frequently-used-items.component';

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
  ],
  imports: [CommonModule, SharedModule, StartPageRoutingModule, KtZhDesignSystemModule],
})
export class StartPageModule {}
