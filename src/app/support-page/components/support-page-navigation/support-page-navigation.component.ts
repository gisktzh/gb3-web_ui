import {Component} from '@angular/core';
import {SupportPage} from '../../../shared/enums/support-page.enum';
import {MatButton} from '@angular/material/button';
import {RouterLinkActive, RouterLink} from '@angular/router';

@Component({
  selector: 'support-page-navigation',
  templateUrl: './support-page-navigation.component.html',
  styleUrls: ['./support-page-navigation.component.scss'],
  imports: [MatButton, RouterLinkActive, RouterLink],
})
export class SupportPageNavigationComponent {
  protected readonly supportPageEnum = SupportPage;
}
