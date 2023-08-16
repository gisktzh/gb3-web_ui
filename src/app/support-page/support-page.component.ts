import {Component} from '@angular/core';
import {SupportPage} from '../shared/enums/support-page.enum';

@Component({
  selector: 'support-page',
  templateUrl: './support-page.component.html',
  styleUrls: ['./support-page.component.scss'],
})
export class SupportPageComponent {
  public readonly supportPageEnum = SupportPage;
}
