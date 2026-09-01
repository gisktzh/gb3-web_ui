import {Component, ChangeDetectionStrategy} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {WaitingPageComponent} from '../../../shared/components/waiting-page/waiting-page.component';

@Component({
  selector: 'login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [WaitingPageComponent],
})
export class LoginRedirectComponent {
  protected readonly mainPageEnum = MainPage;
}
