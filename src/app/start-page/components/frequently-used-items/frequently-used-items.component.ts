import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {FrequentlyUsedItem} from '../../../shared/interfaces/frequently-used-item.interface';
import {Subscription, tap} from 'rxjs';
import {GRAV_CMS_SERVICE} from '../../../app.module';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {catchError} from 'rxjs/operators';
import {FrequentlyUsedItemsCouldNotBeLoaded} from '../../../shared/errors/start-page.errors';
import {Store} from '@ngrx/store';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

const NUMBER_OF_FREQUENTLY_USED_ITEMS = 3;

@Component({
  selector: 'frequently-used-items',
  templateUrl: './frequently-used-items.component.html',
  styleUrls: ['./frequently-used-items.component.scss'],
})
export class FrequentlyUsedItemsComponent implements OnInit, OnDestroy, HasLoadingState {
  public frequentlyUsedItems: FrequentlyUsedItem[] = [];
  public loadingState: LoadingState = 'loading';
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(GRAV_CMS_SERVICE) private readonly gravCmsService: GravCmsService,
    private readonly store: Store,
  ) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
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
            throw new FrequentlyUsedItemsCouldNotBeLoaded(err);
          }),
        )
        .subscribe(),
    );
  }
}
