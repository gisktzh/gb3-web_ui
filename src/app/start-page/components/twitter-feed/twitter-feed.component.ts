import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {ScriptInjectorService} from '../../../shared/services/script-injector.service';
import {Subscription, tap} from 'rxjs';

const TWITTER_ACCOUNT_NAME = 'geoktzh';
const TWITTER_MAX_TWEETS = 4;

@Component({
  selector: 'twitter-feed',
  templateUrl: './twitter-feed.component.html',
  styleUrls: ['./twitter-feed.component.scss']
})
export class TwitterFeedComponent implements AfterViewInit, OnDestroy {
  public feedLoaded: boolean = false;
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
        this.feedLoaded = true;
      });
  }
}
