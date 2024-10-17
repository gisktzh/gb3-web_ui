import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';

const TOOLTIP_TEXT = {
  pointMeasurement: 'Punkt: In Karte klicken um zu wählen.',
  lineMeasurement: 'Strecke: Mit Doppelklick beenden.',
  areaMeasurement: 'Fläche: Auf Startpunkt klicken oder Doppelklick um zu beenden.',
  circleMeasurement: 'Kreis: Mittelpunkt und Radius wählen.',
  elevationProfileMeasurement: 'Höhenprofil: Mit Doppelklick beenden, um das Profil zu laden.',
};
@Component({
  selector: 'measurement-tools',
  templateUrl: './measurement-tools.component.html',
  styleUrls: ['./measurement-tools.component.scss'],
})
export class MeasurementToolsComponent extends AbstractToolsComponent {
  public tooltipText = TOOLTIP_TEXT;
  public togglePointMeasurement() {
    this.toggleTool('measure-point');
  }

  public toggleLineMeasurement() {
    this.toggleTool('measure-line');
  }

  public toggleAreaMeasurement() {
    this.toggleTool('measure-area');
  }

  public toggleCircleMeasurement() {
    this.toggleTool('measure-circle');
  }

  public toggleElevationProfileMeasurement() {
    this.toggleTool('measure-elevation-profile');
  }
}
