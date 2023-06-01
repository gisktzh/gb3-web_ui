import {Component, OnDestroy, OnInit} from '@angular/core';
import {TitleLink} from './components/start-page-section/start-page-section.component';
import {LinksGroup} from '../shared/interfaces/links-group.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectLinks} from '../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit, OnDestroy {
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge'
  };
  public usefulLinksGroups: LinksGroup[] = [];
  private readonly usefulLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectLinks);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.usefulLinksGroups$
        .pipe(
          tap((usefulLinks) => {
            this.usefulLinksGroups = usefulLinks;
          })
        )
        .subscribe()
    );
  }
}
