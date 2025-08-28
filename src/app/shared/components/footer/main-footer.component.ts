import {Component} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';
import {environment} from '../../../../environments/environment';
import {PageSectionComponent} from '../page-section/page-section.component';
import {ContactDetailsComponent} from '../contact-details/contact-details.component';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
  imports: [PageSectionComponent, ContactDetailsComponent, RouterLink],
})
export class MainFooterComponent {
  public readonly dataProtectionLink = [MainPage.Privacy];
  public readonly usageNotesLink = [MainPage.TermsOfUse];
  public readonly appVersion: string = environment.appVersion;
  public readonly appRelease: string = environment.appRelease;
}
