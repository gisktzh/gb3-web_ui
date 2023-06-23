import {AfterViewInit, Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent implements AfterViewInit {
  @Output() public openPrintDialogEvent = new EventEmitter<void>();

  public showPrintDialog() {
    this.openPrintDialogEvent.emit();
  }

  public ngAfterViewInit() {
    // TODO WES: remove
    this.showPrintDialog();
  }
}
