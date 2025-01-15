import {Component, Input} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';

@Component({
  selector: 'waiting-page',
  templateUrl: './waiting-page.component.html',
  styleUrls: ['./waiting-page.component.scss'],
  standalone: false,
})
export class WaitingPageComponent {
  @Input() public waitingText!: string;
  @Input() public redirectMainPage!: MainPage;
}
