import {Component, OnDestroy, OnInit} from '@angular/core';
import {TitleLink} from '../shared/components/start-page-section/start-page-section.component';
import {LinksGroup} from '../shared/interfaces/links-group.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectLinks} from '../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
import {SearchActions} from '../state/app/actions/search.actions';
import {initialState, selectSearchState} from '../state/app/reducers/search.reducer';
import {SearchState} from '../state/app/states/search.state';
import {ConfigService} from '../shared/services/config.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {StartPageSearchOverlayComponent} from './components/start-page-search-overlay/start-page-search-overlay.component';

@Component({
  selector: 'start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent implements OnInit, OnDestroy {
  public readonly externalNewsFeedLink: TitleLink = {
    url: 'https://www.zh.ch/de/news-uebersicht.html?organisation=organisationen%253Akanton-zuerich%252Fbaudirektion%252Famt-fuer-raumentwicklung&topic=themen%253Aplanen-bauen%252Fgeoinformation',
    displayTitle: 'Mehr Beiträge',
  };
  public usefulLinksGroups: LinksGroup[] = [];
  public searchState: SearchState = initialState;

  private searchOverlayRef?: MatDialogRef<StartPageSearchOverlayComponent>;
  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly usefulLinksGroups$: Observable<LinksGroup[]> = this.store.select(selectLinks);
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {}

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.searchOverlayRef?.close();
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.clearSearch());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.usefulLinksGroups$.pipe(tap((usefulLinks) => (this.usefulLinksGroups = usefulLinks))).subscribe());
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
  }

  public openSearchOverlay() {
    this.searchOverlayRef = this.dialogService.open<StartPageSearchOverlayComponent>(StartPageSearchOverlayComponent, {
      restoreFocus: false,
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
    });
    this.subscriptions.add(
      this.searchOverlayRef
        .afterClosed()
        .pipe(
          tap(() => {
            this.store.dispatch(SearchActions.clearSearch());
          }),
        )
        .subscribe(),
    );
  }
}
