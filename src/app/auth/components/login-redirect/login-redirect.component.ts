import {Component} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';

@Component({
  selector: 'login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
  standalone: false,
})
export class LoginRedirectComponent {
  protected readonly mainPageEnum = MainPage;
}
