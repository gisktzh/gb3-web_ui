import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {StartPageRoutingModule} from './start-page-routing.module';
import {StartPageComponent} from './start-page.component';
import {TwitterFeedComponent} from './components/twitter-feed/twitter-feed.component';
import {NewsFeedComponent} from './components/news-feed/news-feed.component';

@NgModule({
  declarations: [StartPageComponent, TwitterFeedComponent, NewsFeedComponent],
  imports: [CommonModule, SharedModule, StartPageRoutingModule]
})
export class StartPageModule {}
