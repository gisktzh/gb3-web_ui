import {Component} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';
import {SupportPage} from '../../enums/support-page.enum';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent {
  public readonly dataProtectionLink = [MainPage.Privacy];
  public readonly usageNotesLink = [MainPage.TermsOfUse];
  public readonly appVersion: string = environment.appVersion;
  public readonly appRelease: string = environment.appRelease;
}
