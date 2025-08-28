import {Component, Input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'external-link-button',
  templateUrl: './external-link-button.component.html',
  styleUrls: ['./external-link-button.component.scss'],
  imports: [MatIconButton, ClickOnSpaceBarDirective, NgClass, MatTooltip, MatIcon],
})
export class ExternalLinkButtonComponent {
  @Input() public url!: string;
  @Input() public size: 'small' | 'regular' = 'regular';
  @Input() public highlighted: boolean = false;
  @Input() public color: 'primary' | 'accent' = 'primary';
  @Input() public toolTip?: string;
  @Input() public disableTabFocus: boolean = false;
}
