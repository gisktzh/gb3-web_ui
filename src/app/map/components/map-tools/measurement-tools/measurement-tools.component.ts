import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';

@Component({
  selector: 'measurement-tools',
  templateUrl: './measurement-tools.component.html',
  styleUrls: ['./measurement-tools.component.scss'],
})
export class MeasurementToolsComponent extends AbstractToolsComponent {
  public togglePointMeasurement() {
    this.toggleTool('measure-point');
  }

  public toggleLineMeasurement() {
    this.toggleTool('measure-line');
  }

  public toggleAreaMeasurement() {
    this.toggleTool('measure-area');
  }

  public toggleElevationProfileMeasurement() {
    this.toggleTool('measure-elevation-profile');
  }
}
