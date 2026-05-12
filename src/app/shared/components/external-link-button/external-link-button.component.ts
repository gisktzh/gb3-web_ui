import {Component, input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';

import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'external-link-button',
  templateUrl: './external-link-button.component.html',
  styleUrls: ['./external-link-button.component.scss'],
  imports: [MatIconButton, ClickOnSpaceBarDirective, MatTooltip, MatIcon],
})
export class ExternalLinkButtonComponent {
  public url = input.required<string>();
  public size = input<'small' | 'regular'>('regular');
  public highlighted = input(false);
  public color = input<'primary' | 'accent'>('primary');
  public toolTip = input<string>();
  public disableTabFocus = input(false);
}
