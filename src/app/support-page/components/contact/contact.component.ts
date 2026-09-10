import {Component, ChangeDetectionStrategy} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink],
})
export class ContactComponent {
  protected readonly mainPageEnum = MainPage;
}
