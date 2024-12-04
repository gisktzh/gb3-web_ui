import {Component} from '@angular/core';
import {SharedModule} from '../shared/shared.module';

@Component({
  selector: 'apps-page',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './apps-page.component.html',
  styleUrl: './apps-page.component.scss',
})
export class AppsPageComponent {}
