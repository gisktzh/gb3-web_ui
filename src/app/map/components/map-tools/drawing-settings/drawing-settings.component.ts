import {Component} from '@angular/core';
import {ColorUtils} from '../../../../shared/utils/color.utils';
import {DrawingStyleActions} from '../../../../state/map/actions/drawing-style.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'drawing-settings',
  templateUrl: './drawing-settings.component.html',
  styleUrls: ['./drawing-settings.component.scss'],
})
export class DrawingSettingsComponent {
  // todo: inital settings

  constructor(private readonly store: Store) {}

  public changeFill(event: any) {
    const color = ColorUtils.convertHexToSymbolizationColor(event.target.value, 0.6); // todo: default style extraction
    this.store.dispatch(DrawingStyleActions.setFillColor({color}));
  }

  public changeLine(event: any) {
    const color = ColorUtils.convertHexToSymbolizationColor(event.target.value);

    this.store.dispatch(DrawingStyleActions.setLineColor({color}));
  }

  public changeWidth(event: any) {
    this.store.dispatch(DrawingStyleActions.setLineWidth({width: event.target.value}));
  }
}
