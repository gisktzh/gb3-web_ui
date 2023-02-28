import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {ScriptInjectorService} from '../../../shared/services/script-injector.service';
import {of, Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs/operators';

const TWITTER_ACCOUNT_NAME = 'geoktzh';
const TWITTER_MAX_TWEETS = 4;

@Component({
  selector: 'twitter-feed',
  templateUrl: './twitter-feed.component.html',
  styleUrls: ['./twitter-feed.component.scss']
})
export class TwitterFeedComponent implements AfterViewInit, OnDestroy {
  public feedLoaded: 'loading' | 'loaded' | 'error' = 'loading';
  @ViewChild('twitterFeed') private readonly twitterFeedContainer!: ElementRef;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly scriptInjectorService: ScriptInjectorService) {}

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
          catchError(() => {
            this.feedLoaded = 'error';
            return of(null);
          }),
          tap((value) => {
            if (value === null) {
              this.feedLoaded = 'error';
            }
          })
        )
        .subscribe()
    );
  }

  private loadTwitterFeed(twitterWidget: Twitter) {
    twitterWidget.widgets
      .createTimeline(
        {
          sourceType: 'profile',
          screenName: TWITTER_ACCOUNT_NAME
        },
        this.twitterFeedContainer.nativeElement,
        {
          dnt: true,
          tweetLimit: TWITTER_MAX_TWEETS
        }
      )
      .then(() => {
        this.feedLoaded = 'loaded';
      });
  }
}
