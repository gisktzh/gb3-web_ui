import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PageSectionComponent} from '../shared/components/page-section/page-section.component';
import {HeroHeaderComponent} from '../shared/components/hero-header/hero-header.component';
import {PrivacyContentComponent} from './components/privacy-content/privacy-content.component';

const PRIVACY_SUMMARY =
  'In den Informationen und Richtlinien zum Datenschutz finden Sie die Angaben zur Verarbeitung personenbezogener Daten, den Umfang der Datenverarbeitung, die Verwendung von Cookies und was alles bei der Registrierung gespeichert wird.';

@Component({
  selector: 'privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
  imports: [PageSectionComponent, HeroHeaderComponent, PrivacyContentComponent],
})
export class PrivacyPageComponent {
  private readonly store = inject(Store);
  public heroText = PRIVACY_SUMMARY;
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
