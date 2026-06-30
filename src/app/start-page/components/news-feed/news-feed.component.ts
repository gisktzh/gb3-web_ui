import {Component, inject, signal} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {map, catchError} from 'rxjs';
import {NewsService} from '../../../shared/interfaces/news-service.interface';
import {NewsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {NEWS_SERVICE} from '../../../app.tokens';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';
import {LinkGridListComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';
import {HasLoadingStateSignal} from 'src/app/shared/interfaces/has-loading-state-signal.interface';
import {toSignal} from '@angular/core/rxjs-interop';

const NUMBER_OF_NEWS = 3;

@Component({
  selector: 'news-feed',
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss'],
  imports: [ContentLoadingStateComponent, LinkGridListComponent, LinkGridListItemComponent],
})
export class NewsFeedComponent implements HasLoadingStateSignal {
  private readonly newsService = inject<NewsService>(NEWS_SERVICE);

  public readonly loadingState = signal<LoadingState>('loading');
  public readonly news = toSignal(
    this.newsService.loadNews().pipe(
      map((news) => {
        this.loadingState.set('loaded');
        return news.slice(0, NUMBER_OF_NEWS);
      }),
      catchError((err: unknown) => {
        this.loadingState.set('error');
        throw new NewsCouldNotBeLoaded(err);
      }),
    ),
    {initialValue: []},
  );
}
