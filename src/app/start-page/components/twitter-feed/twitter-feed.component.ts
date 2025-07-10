import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject} from '@angular/core';
import {ScriptInjectorService} from '../../../shared/services/script-injector.service';
import {Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';

import {TwitterFeedCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';

const TWITTER_ACCOUNT_NAME = 'geoktzh';
const TWITTER_MAX_TWEETS = 4;

@Component({
  selector: 'twitter-feed',
  templateUrl: './twitter-feed.component.html',
  styleUrls: ['./twitter-feed.component.scss'],
  imports: [ContentLoadingStateComponent],
})
export class TwitterFeedComponent implements AfterViewInit, OnDestroy, HasLoadingState {
  private readonly scriptInjectorService = inject(ScriptInjectorService);

  public loadingState: LoadingState = 'loading';
  @ViewChild('twitterFeed') private readonly twitterFeedContainer!: ElementRef;
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.scriptInjectorService
        .injectTwitterFeedApi()
        .pipe(
          tap((twitterEmbedScript) => {
            twitterEmbedScript.ready((twitterWidget) => {
              this.loadTwitterFeed(twitterWidget);
            });
          }),
          catchError((err: unknown) => {
            this.loadingState = 'error';
            throw new TwitterFeedCouldNotBeLoaded(err);
          }),
        )
        .subscribe(),
    );
  }

  private loadTwitterFeed(twitterWidget: Twitter) {
    twitterWidget.widgets
      .createTimeline(
        {
          sourceType: 'profile',
          screenName: TWITTER_ACCOUNT_NAME,
        },
        this.twitterFeedContainer.nativeElement,
        {
          dnt: true,
          tweetLimit: TWITTER_MAX_TWEETS,
          lang: 'de',
          chrome: 'nofooter',
        },
      )
      .then(() => {
        this.loadingState = 'loaded';
      });
  }
}
