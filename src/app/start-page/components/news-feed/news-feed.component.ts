import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {Subscription, tap} from 'rxjs';
import {NEWS_SERVICE} from '../../../app.module';
import {catchError} from 'rxjs';
import {NewsService} from '../../../shared/interfaces/news-service.interface';
import {News} from '../../../shared/interfaces/news.interface';

import {NewsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';

const NUMBER_OF_NEWS = 3;

@Component({
  selector: 'news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss'],
  standalone: false,
})
export class NewsFeedComponent implements OnInit, HasLoadingState, OnDestroy {
  public loadingState: LoadingState = 'loading';
  public news: News[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(NEWS_SERVICE) private readonly newsService: NewsService) {}

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
