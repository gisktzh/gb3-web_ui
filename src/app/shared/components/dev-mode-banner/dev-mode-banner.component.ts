import {Component} from '@angular/core';
import {SharedModule} from '../../shared.module';

@Component({
  selector: 'dev-mode-banner',
  imports: [SharedModule],
  templateUrl: './dev-mode-banner.component.html',
  styleUrl: './dev-mode-banner.component.scss',
})
export class DevModeBannerComponent {}
