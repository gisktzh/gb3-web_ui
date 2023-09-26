import {Component, Input} from '@angular/core';
import {FaqItem} from '../../../../shared/interfaces/faq.interface';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {SupportPage} from '../../../../shared/enums/support-page.enum';

@Component({
  selector: 'search-result-entry-support',
  templateUrl: './search-result-entry-support.component.html',
  styleUrls: ['./search-result-entry-support.component.scss'],
})
export class SearchResultEntrySupportComponent {
  @Input() public filteredFaqItems: FaqItem[] = [];

  protected readonly mainPageEnum = MainPage;
  protected readonly supportPageEnum = SupportPage;
}
