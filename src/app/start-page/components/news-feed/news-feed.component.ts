import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {KTZHNewsService} from '../../../shared/services/apis/ktzh/ktzhnews.service';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {KTZHNews} from '../../../shared/interfaces/ktzh-news.interface';
import {Subscription, tap, throwError} from 'rxjs';
import {NEWS_SERVICE} from '../../../app.module';
import {catchError} from 'rxjs/operators';

const NUMBER_OF_NEWS = 3;

@Component({
  selector: 'news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss']
})
export class NewsFeedComponent implements OnInit, HasLoadingState, OnDestroy {
  public loadingState: LoadingState = 'loading';
  public news: KTZHNews[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(NEWS_SERVICE) private readonly newsService: KTZHNewsService) {}

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
            return throwError(() => err);
          })
        )
        .subscribe()
    );
  }
}
