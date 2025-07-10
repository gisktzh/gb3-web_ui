import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs';
import {NewsService} from '../../../shared/interfaces/news-service.interface';
import {News} from '../../../shared/interfaces/news.interface';

import {NewsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {NEWS_SERVICE} from '../../../app.tokens';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';
import {LinkGridListComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';

const NUMBER_OF_NEWS = 3;

@Component({
  selector: 'news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss'],
  imports: [ContentLoadingStateComponent, LinkGridListComponent, LinkGridListItemComponent],
})
export class NewsFeedComponent implements OnInit, HasLoadingState, OnDestroy {
  private readonly newsService = inject<NewsService>(NEWS_SERVICE);

  public loadingState: LoadingState = 'loading';
  public news: News[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.newsService
        .loadNews()
        .pipe(
          tap((news) => {
            this.news = news.slice(0, NUMBER_OF_NEWS);
            this.loadingState = 'loaded';
          }),
          catchError((err: unknown) => {
            this.loadingState = 'error';
            throw new NewsCouldNotBeLoaded(err);
          }),
        )
        .subscribe(),
    );
  }
}
