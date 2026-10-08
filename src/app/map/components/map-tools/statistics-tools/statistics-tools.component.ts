import {Component, ChangeDetectionStrategy} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';
import {MatIconButton} from '@angular/material/button';

import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

const TOOLTIP_TEXT = {
  circleSelecting: 'Kreis-Selektion: Mittelpunkt und Radius wählen.',
  polygonSelecting: 'Polygon-Selektion: Auf Startpunkt klicken oder Doppelklick um zu beenden.',
};

@Component({
  selector: 'statistics-tools',
  templateUrl: './statistics-tools.component.html',
  styleUrls: ['./statistics-tools.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatIconButton, MatTooltip, MatIcon],
})
export class StatisticsToolsComponent extends AbstractToolsComponent {
  public tooltipText = TOOLTIP_TEXT;

  public toggleCircleSelecting() {
    this.toggleTool('select-statistics-circle');
  }

  public togglePolygonSelecting() {
    this.toggleTool('select-statistics-polygon');
  }
}
