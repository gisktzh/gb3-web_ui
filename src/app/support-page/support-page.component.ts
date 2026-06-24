import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../state/app/reducers/app-layout.reducer';
import {selectAdditionalInformationLinks} from '../state/support/reducers/support-content.reducer';
import {PageSectionComponent} from '../shared/components/page-section/page-section.component';
import {HeroHeaderComponent} from '../shared/components/hero-header/hero-header.component';
import {SupportPageNavigationComponent} from './components/support-page-navigation/support-page-navigation.component';
import {RouterOutlet} from '@angular/router';
import {LinkListComponent} from '../shared/components/lists/link-list/link-list.component';

const SUPPORT_PAGE_SUMMARY =
  'Hier finden Sie Antworten auf häufig gestellte Fragen zu unseren Anwendungen und Services sowie weitere Informationen. Bei Bedarf können Sie eine Anfrage an unser Hilfecenter senden.';

@Component({
  selector: 'support-page',
  templateUrl: './support-page.component.html',
  styleUrls: ['./support-page.component.scss'],
  imports: [PageSectionComponent, HeroHeaderComponent, SupportPageNavigationComponent, RouterOutlet, LinkListComponent],
})
export class SupportPageComponent {
  private readonly store = inject(Store);

  public heroText = SUPPORT_PAGE_SUMMARY;
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly additionalInformationLinksGroups = this.store.selectSignal(selectAdditionalInformationLinks);
}
