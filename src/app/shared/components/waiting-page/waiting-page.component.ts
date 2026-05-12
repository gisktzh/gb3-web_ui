import {Component, input} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'waiting-page',
  templateUrl: './waiting-page.component.html',
  styleUrls: ['./waiting-page.component.scss'],
  imports: [MatProgressSpinner, RouterLink],
})
export class WaitingPageComponent {
  public waitingText = input.required<string>();
  public redirectMainPage = input.required<MainPage>();
}
