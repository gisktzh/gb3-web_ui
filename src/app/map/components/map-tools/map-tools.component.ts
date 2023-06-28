import {Component, EventEmitter, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {ToolActions} from 'src/app/state/map/actions/tool.actions';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent {
  @Output() public openPrintDialogEvent = new EventEmitter<void>();

  constructor(private readonly store: Store) {}

  public showPrintDialog() {
    this.openPrintDialogEvent.emit();
  }

  public toggleLineMeasurement() {
    this.store.dispatch(ToolActions.toggle({tool: 'measure-line'}));
  }
}
