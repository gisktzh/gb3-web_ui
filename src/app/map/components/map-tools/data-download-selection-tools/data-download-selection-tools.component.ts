import {Component} from '@angular/core';
import {AbstractToolsComponent} from '../abstract-tools/abstract-tools.component';

@Component({
  selector: 'data-download-selection-tools',
  templateUrl: './data-download-selection-tools.component.html',
  styleUrls: ['./data-download-selection-tools.component.scss'],
})
export class DataDownloadSelectionToolsComponent extends AbstractToolsComponent {
  public toggleCircleSelecting() {
    this.toggleTool('select-circle');
  }

  togglePolygonSelecting() {
    this.toggleTool('select-polygon');
  }

  toggleRectangleSelecting() {
    this.toggleTool('select-rectangle');
  }

  toggleSectionSelecting() {
    this.toggleTool('select-section');
  }

  toggleCantonSelecting() {
    this.toggleTool('select-canton');
  }

  toggleMunicipalitySelecting() {
    this.toggleTool('select-municipality');
  }
}
