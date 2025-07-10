import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Observable, Subscription, tap} from 'rxjs';
import {selectFaq} from '../../../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
import {FaqCollection} from '../../../shared/interfaces/faq.interface';
import {CdkAccordion} from '@angular/cdk/accordion';
import {GenericUnorderedListComponent} from '../../../shared/components/lists/generic-unordered-list/generic-unordered-list.component';
import {AccordionItemComponent} from '../../../shared/components/accordion-item/accordion-item.component';
import {FormatContentPipe} from '../../../shared/pipes/format-content.pipe';

@Component({
  selector: 'faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [CdkAccordion, GenericUnorderedListComponent, AccordionItemComponent, FormatContentPipe],
})
export class FaqComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public faqCollections: FaqCollection[] = [];
  private readonly faqCollections$: Observable<FaqCollection[]> = this.store.select(selectFaq);
  private readonly subscriptions: Subscription = new Subscription();

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
          }),
        )
        .subscribe(),
    );
  }
}
