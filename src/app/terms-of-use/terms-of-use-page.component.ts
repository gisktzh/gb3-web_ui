import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PageSectionComponent} from '../shared/components/page-section/page-section.component';
import {HeroHeaderComponent} from '../shared/components/hero-header/hero-header.component';
import {UsageRulesComponent} from './components/usage-rules/usage-rules.component';
import {TermsOfUseGeodataAndMapsComponent} from './components/terms-of-use-geodata-and-maps/terms-of-use-geodata-and-maps.component';

const TERMS_OF_USE_SUMMARY =
  'Diese Nutzungshinweise gelten für die Website zh.ch und deren direkte Unterseiten, ausser, es wird für eine konkrete Seite bzw. für ein konkretes Angebot ausdrücklich etwas Abweichendes bekannt gegeben.';

@Component({
  selector: 'terms-of-use-page',
  templateUrl: './terms-of-use-page.component.html',
  styleUrls: ['./terms-of-use-page.component.scss'],
  imports: [PageSectionComponent, HeroHeaderComponent, UsageRulesComponent, TermsOfUseGeodataAndMapsComponent],
})
export class TermsOfUsePageComponent {
  private readonly store = inject(Store);

  public heroText = TERMS_OF_USE_SUMMARY;
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
