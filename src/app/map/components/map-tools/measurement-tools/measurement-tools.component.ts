import {Component} from '@angular/core';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'measurement-tools',
  templateUrl: './measurement-tools.component.html',
  styleUrls: ['./measurement-tools.component.scss']
})
export class MeasurementToolsComponent {
  constructor(private readonly store: Store) {}

  public togglePointMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-point'}));
  }

  public toggleLineMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
  }

  public toggleAreaMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-area'}));
  }
}
