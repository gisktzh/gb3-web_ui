import {Component} from '@angular/core';
import {ExternalLinkButtonComponent} from './external-link-button.component';
import {MatIconButton} from '@angular/material/button';
import {ClickOnSpaceBarDirective} from '../../directives/click-on-spacebar.directive';
import {NgClass} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'gb2-exit-button',
  templateUrl: './external-link-button.component.html',
  styleUrls: ['./external-link-button.component.scss'],
  imports: [MatIconButton, ClickOnSpaceBarDirective, NgClass, MatTooltip, MatIcon],
})
export class Gb2ExitButtonComponent extends ExternalLinkButtonComponent {
  public override toolTip?: string =
    'Diese Karte ist noch nicht im neuen GIS-Browser verfügbar. Öffnen Sie die Karte im alten GIS-Browser mit diesem Link.';
}
