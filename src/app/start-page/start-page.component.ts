import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription, tap} from 'rxjs';
import {TitleLink} from '../shared/components/page-section/page-section.component';
import {LinksGroup} from '../shared/interfaces/links-group.interface';
import {ScreenMode} from '../shared/types/screen-size.type';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectAdditionalInformationLinks} from '../state/support/reducers/support-content.reducer';

const START_PAGE_SUMMARY =
  'Das Geoportal bietet Ihnen einen zentralen Zugang zu den Geodaten des Kantons Zürich. Auf dieser Informationsplattform können Sie die Daten über verschiedene Auskunftssysteme sichten oder beziehen.';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent implements OnInit, OnDestroy {
  public heroText = START_PAGE_SUMMARY;
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge',
  };
  public additionalInformationLinksGroups: LinksGroup[] = [];
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly additionalInformationLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectAdditionalInformationLinks);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.additionalInformationLinksGroups$
        .pipe(tap((additionalInformationLinks) => (this.additionalInformationLinksGroups = additionalInformationLinks)))
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
