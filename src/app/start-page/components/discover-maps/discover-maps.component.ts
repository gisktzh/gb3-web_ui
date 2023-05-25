import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, tap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DiscoverMapsItem} from '../../../shared/interfaces/discover-maps-item.interface';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {GRAV_CMS_SERVICE} from '../../../app.module';

const NUMBER_OF_ENTRIES = 2;
@Component({
  selector: 'discover-maps',
  templateUrl: './discover-maps.component.html',
  styleUrls: ['./discover-maps.component.scss']
})
export class DiscoverMapsComponent implements OnInit, HasLoadingState, OnDestroy {
  // expose the enum to the HTML
  public readonly mainPageEnum = MainPage;

  public loadingState: LoadingState = 'loading';
  public discoverMapsItems: DiscoverMapsItem[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(GRAV_CMS_SERVICE) private readonly gravCmsService: GravCmsService) {}

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
            return throwError(() => err);
          })
        )
        .subscribe()
    );
  }
}
