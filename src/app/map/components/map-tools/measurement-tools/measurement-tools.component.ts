import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';

import {MeasurementTool} from '../../../../shared/types/measurement-tool';

@Component({
  selector: 'measurement-tools',
  templateUrl: './measurement-tools.component.html',
  styleUrls: ['./measurement-tools.component.scss']
})
export class MeasurementToolsComponent implements OnInit, OnDestroy {
  public activeTool: MeasurementTool | undefined = undefined;
  private readonly activeTool$ = this.store.select(selectActiveTool);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public togglePointMeasurement() {
    this.toggleTool('measure-point');
  }

  public toggleLineMeasurement() {
    this.toggleTool('measure-line');
  }

  public toggleAreaMeasurement() {
    this.toggleTool('measure-area');
  }

  private toggleTool(tool: MeasurementTool) {
    if (this.activeTool === tool) {
      this.store.dispatch(ToolActions.deactivateTool());
    } else {
      this.store.dispatch(ToolActions.activateTool({tool}));
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.activeTool$.pipe(tap((activeTool) => (this.activeTool = activeTool))).subscribe());
  }
}
