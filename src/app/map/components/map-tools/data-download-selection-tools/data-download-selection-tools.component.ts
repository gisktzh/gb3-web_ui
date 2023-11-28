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

  public togglePolygonSelecting() {
    this.toggleTool('select-polygon');
  }

  public toggleRectangleSelecting() {
    this.toggleTool('select-rectangle');
  }

  public toggleSectionSelecting() {
    this.toggleTool('select-section');
  }

  public toggleCantonSelecting() {
    this.toggleTool('select-canton');
  }

  public toggleMunicipalitySelecting() {
    this.toggleTool('select-municipality');
  }
}
