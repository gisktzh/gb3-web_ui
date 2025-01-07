import {Component} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';

@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: false,
})
export class ContactComponent {
  protected readonly mainPageEnum = MainPage;
}
