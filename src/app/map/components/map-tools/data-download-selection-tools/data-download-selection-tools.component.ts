import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {MatIconButton} from '@angular/material/button';

import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';

const TOOLTIP_TEXT = {
  circleSelecting: 'Kreis-Selektion: Mittelpunkt und Radius wählen.',
  polygonSelecting: 'Polygon-Selektion: Auf Startpunkt klicken oder Doppelklick um zu beenden.',
  rectangleSelecting: 'Rechteck-Selektion: Diagonale Eckpunkte wählen.',
  sectionSelecting: 'Selektion: Aktueller Karten-Ausschnitt.',
  federationSelecting: 'Selektion: Ganze Schweiz.',
  cantonSelecting: 'Selektion: Ganzer Kanton Zürich.',
  municipalitySelecting: 'Selektion: Auswahl einer Zürcher Gemeinde.',
};
@Component({
  selector: 'data-download-selection-tools',
  templateUrl: './data-download-selection-tools.component.html',
  styleUrls: ['./data-download-selection-tools.component.scss'],
  imports: [MatIconButton, MatTooltip, MatIcon, MatDivider],
})
export class DataDownloadSelectionToolsComponent extends AbstractToolsComponent {
  public tooltipText = TOOLTIP_TEXT;
  public toggleCircleSelecting() {
    this.toggleTool('select-circle');
  }

  public togglePolygonSelecting() {
    this.toggleTool('select-polygon');
  }

  public toggleRectangleSelecting() {
    this.toggleTool('select-rectangle');
  }

  public toggleSectionSelecting() {
    this.toggleTool('select-section');
  }

  public toggleFederationSelecting() {
    this.toggleTool('select-federation');
  }

  public toggleCantonSelecting() {
    this.toggleTool('select-canton');
  }

  public toggleMunicipalitySelecting() {
    this.toggleTool('select-municipality');
  }
}
