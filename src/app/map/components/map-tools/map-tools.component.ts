import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {ToolActions} from 'src/app/state/map/actions/tool.actions';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent {
  constructor(private readonly store: Store) {}

  public showPrintDialog() {
    this.store.dispatch(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'print'}));
  }

  public togglePointMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-point'}));
  }

  public toggleLineMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-line'}));
  }

  public toggleAreaMeasurement() {
    this.store.dispatch(ToolActions.activateTool({tool: 'measure-area'}));
  }

  public showShareLinkDialog() {
    this.store.dispatch(MapUiActions.showShareLinkDialog());
  }
}
