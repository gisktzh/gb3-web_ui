import {Component, inject, signal} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {map, catchError} from 'rxjs';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {DiscoverMapsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';
import {LinkGridListComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../../../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';
import {HasLoadingStateSignal} from 'src/app/shared/interfaces/has-loading-state-signal.interface';
import {toSignal} from '@angular/core/rxjs-interop';

const NUMBER_OF_ENTRIES = 2;

@Component({
  selector: 'discover-maps',
  templateUrl: './discover-maps.component.html',
  styleUrls: ['./discover-maps.component.scss'],
  imports: [ContentLoadingStateComponent, LinkGridListComponent, LinkGridListItemComponent],
})
export class DiscoverMapsComponent implements HasLoadingStateSignal {
  private readonly gravCmsService = inject<GravCmsService>(GRAV_CMS_SERVICE);
  public readonly loadingState = signal<LoadingState>('loading');
  public readonly discoverMapsItems = toSignal(
    this.gravCmsService.loadDiscoverMapsData().pipe(
      map((discoverMapsItems) => {
        this.loadingState.set('loaded');
        return discoverMapsItems.slice(0, NUMBER_OF_ENTRIES);
      }),
      catchError((err: unknown) => {
        this.loadingState.set('error');
        throw new DiscoverMapsCouldNotBeLoaded(err);
      }),
    ),
    {initialValue: []},
  );

  protected readonly mainPageEnum = MainPage;
}
