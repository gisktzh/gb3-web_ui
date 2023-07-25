import {Component} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';
import {SupportPage} from '../../enums/support-page.enum';

@Component({
  selector: 'main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent {
  public readonly dataProtectionLink = [MainPage.Support, SupportPage.UsefulLinks];
  public readonly usageNotesLink = [MainPage.Support, SupportPage.Faq];
}
