import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, tap, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {DiscoverMapsItem} from '../../../shared/interfaces/discover-maps-item.interface';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';

@Component({
  selector: 'discover-maps',
  templateUrl: './discover-maps.component.html',
  styleUrls: ['./discover-maps.component.scss']
})
export class DiscoverMapsComponent implements OnInit, HasLoadingState, OnDestroy {
  public loadingState: LoadingState = 'loading';
  public discoverMapsItems: DiscoverMapsItem[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly gravCmsService: GravCmsService) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.gravCmsService
        .loadDiscoverMapsData()
        .pipe(
          tap((discoverMapsItems) => {
            this.discoverMapsItems = discoverMapsItems;
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
