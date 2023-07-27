import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {FrequentlyUsedItem} from '../../../shared/interfaces/frequently-used-item.interface';
import {Subscription, tap} from 'rxjs';
import {GRAV_CMS_SERVICE} from '../../../app.module';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {catchError} from 'rxjs/operators';
import {FrequentlyUsedItemsCouldNotBeLoaded} from '../../models/errors';

const NUMBER_OF_FREQUENTLY_USED_ITEMS = 3;

@Component({
  selector: 'frequently-used-items',
  templateUrl: './frequently-used-items.component.html',
  styleUrls: ['./frequently-used-items.component.scss'],
})
export class FrequentlyUsedItemsComponent implements OnInit, OnDestroy, HasLoadingState {
  public frequentlyUsedItems: FrequentlyUsedItem[] = [];
  public loadingState: LoadingState = 'loading';
  private readonly subscriptions: Subscription = new Subscription();

  constructor(@Inject(GRAV_CMS_SERVICE) private readonly gravCmsService: GravCmsService) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.gravCmsService
        .loadFrequentlyUsedData()
        .pipe(
          tap((frequentlyUsedItems) => {
            this.frequentlyUsedItems = frequentlyUsedItems.slice(0, NUMBER_OF_FREQUENTLY_USED_ITEMS);
            this.loadingState = 'loaded';
          }),
          catchError((err: unknown) => {
            this.loadingState = 'error';
            throw new FrequentlyUsedItemsCouldNotBeLoaded();
          }),
        )
        .subscribe(),
    );
  }
}
