import {Component} from '@angular/core';
import {ExternalLinkButtonComponent} from './external-link-button.component';

@Component({
  selector: 'gb2-exit-button',
  templateUrl: './external-link-button.component.html',
  styleUrls: ['./external-link-button.component.scss'],
})
export class Gb2ExitButtonComponent extends ExternalLinkButtonComponent {
  public override toolTip?: string =
    'Diese Karte ist noch nicht im neuen GIS-Browser verfügbar. Öffnen Sie die Karte im alten GIS-Browser mit diesem Link.';
}
