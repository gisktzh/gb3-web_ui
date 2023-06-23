import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent {
  @Output() public openPrintDialogEvent = new EventEmitter<void>();

  public showPrintDialog() {
    this.openPrintDialogEvent.emit();
  }
}
