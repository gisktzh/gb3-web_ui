import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'map-overlay',
  templateUrl: './map-overlay.component.html',
  styleUrls: ['./map-overlay.component.scss']
})
export class MapOverlayComponent {
  @Input() public isVisible: boolean = false;
  @Input() public title: string = '';
  @Input() public location: 'left' | 'right' = 'left';
  @Output() public closeEvent = new EventEmitter<void>();

  public onClose() {
    this.closeEvent.emit();
  }
}
