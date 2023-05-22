import {Component} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';

@Component({
  selector: 'login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss']
})
export class LoginRedirectComponent {
  // expose the enum to the HTML
  public readonly mainPageEnum = MainPage;
}
