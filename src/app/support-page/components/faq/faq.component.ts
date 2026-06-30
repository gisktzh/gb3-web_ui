import {Component, inject} from '@angular/core';
import {selectFaq} from '../../../state/support/reducers/support-content.reducer';
import {Store} from '@ngrx/store';
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
export class FaqComponent {
  private readonly store = inject(Store);

  public readonly faqCollections = this.store.selectSignal(selectFaq);
}
