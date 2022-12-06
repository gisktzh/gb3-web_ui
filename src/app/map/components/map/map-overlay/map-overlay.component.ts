import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss']
})
export class MapOverlayComponent {
  @Input() public isVisible: boolean = false;
  @Input() public title: string = '';
  @Output() public closeEvent = new EventEmitter<void>();

  constructor() {}

  public onClose() {
    this.closeEvent.emit();
  }
}
