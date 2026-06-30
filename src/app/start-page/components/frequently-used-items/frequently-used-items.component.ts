import {Component, inject, signal} from '@angular/core';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {FrequentlyUsedItemsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';
import {ContentLoadingStateComponent} from '../content-loading-state/content-loading-state.component';
import {GenericUnorderedListComponent} from '../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';
import {HasLoadingStateSignal} from 'src/app/shared/interfaces/has-loading-state-signal.interface';
import {catchError, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {NgTemplateOutlet} from '@angular/common';

const NUMBER_OF_FREQUENTLY_USED_ITEMS = 3;

@Component({
  selector: 'frequently-used-items',
  templateUrl: './frequently-used-items.component.html',
  styleUrls: ['./frequently-used-items.component.scss'],
  imports: [ContentLoadingStateComponent, GenericUnorderedListComponent, NgTemplateOutlet],
})
export class FrequentlyUsedItemsComponent implements HasLoadingStateSignal {
  private readonly gravCmsService = inject<GravCmsService>(GRAV_CMS_SERVICE);
  private readonly store = inject(Store);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly loadingState = signal<LoadingState>('loading');
  public readonly frequentlyUsedItems = toSignal(
    this.gravCmsService.loadFrequentlyUsedData().pipe(
      map((items) => {
        this.loadingState.set('loaded');
        return items.slice(0, NUMBER_OF_FREQUENTLY_USED_ITEMS);
      }),
      catchError((err: unknown) => {
        this.loadingState.set('error');
        throw new FrequentlyUsedItemsCouldNotBeLoaded(err);
      }),
    ),
    {
      initialValue: [],
    },
  );
}
