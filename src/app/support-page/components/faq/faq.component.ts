import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {selectFaq} from '../../../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
import {FaqCollection} from '../../../shared/interfaces/faq.interface';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, OnDestroy {
  public faqCollections: FaqCollection[] = [];
  private readonly faqCollections$: Observable<FaqCollection[]> = this.store.select(selectFaq);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.faqCollections$
        .pipe(
          tap((faqCollections) => {
            this.faqCollections = faqCollections;
          })
        )
        .subscribe()
    );
  }
}
