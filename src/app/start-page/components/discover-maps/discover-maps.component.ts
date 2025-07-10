import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {Subscription, tap} from 'rxjs';
import {catchError} from 'rxjs';
import {DiscoverMapsItem} from '../../../shared/interfaces/discover-maps-item.interface';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {MainPage} from '../../../shared/enums/main-page.enum';

import {DiscoverMapsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';
import {LinkGridListComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';

const NUMBER_OF_ENTRIES = 2;

@Component({
  selector: 'discover-maps',
  templateUrl: './discover-maps.component.html',
  styleUrls: ['./discover-maps.component.scss'],
  imports: [ContentLoadingStateComponent, LinkGridListComponent, LinkGridListItemComponent],
})
export class DiscoverMapsComponent implements OnInit, HasLoadingState, OnDestroy {
  private readonly gravCmsService = inject<GravCmsService>(GRAV_CMS_SERVICE);

  public loadingState: LoadingState = 'loading';
  public discoverMapsItems: DiscoverMapsItem[] = [];

  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions: Subscription = new Subscription();

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.gravCmsService
        .loadDiscoverMapsData()
        .pipe(
          tap((discoverMapsItems) => {
            this.discoverMapsItems = discoverMapsItems.slice(0, NUMBER_OF_ENTRIES);
            this.loadingState = 'loaded';
          }),
          catchError((err: unknown) => {
            this.loadingState = 'error';
            throw new DiscoverMapsCouldNotBeLoaded(err);
          }),
        )
        .subscribe(),
    );
  }
}
