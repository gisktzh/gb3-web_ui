import {Component, OnDestroy, OnInit} from '@angular/core';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {FrequentlyUsedItem} from '../../../shared/interfaces/frequently-used-item.interface';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'frequently-used-items',
  templateUrl: './frequently-used-items.component.html',
  styleUrls: ['./frequently-used-items.component.scss']
})
export class FrequentlyUsedItemsComponent implements OnInit, OnDestroy {
  public frequentlyUsedItems: FrequentlyUsedItem[] = [];
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly gravCmsService: GravCmsService) {}

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
            this.frequentlyUsedItems = frequentlyUsedItems;
          })
        )
        .subscribe()
    );
  }
}
