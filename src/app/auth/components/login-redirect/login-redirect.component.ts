import {Component} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {WaitingPageComponent} from '../../../shared/components/waiting-page/waiting-page.component';

@Component({
  selector: 'login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
  imports: [WaitingPageComponent],
})
export class LoginRedirectComponent {
  protected readonly mainPageEnum = MainPage;
}
