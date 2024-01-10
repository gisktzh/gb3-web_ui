import {Component, Input, OnInit} from '@angular/core';
import {DatasetLayer} from '../../../../shared/interfaces/dataset-layer.interface';
import {NgForOf, NgIf} from '@angular/common';
import {DataDisplayElement} from '../../../types/data-display-element.type';
import {DataDisplayComponent} from '../../data-display/data-display.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {SharedModule} from '../../../../shared/shared.module';
import {DatasetElementTableComponent} from '../dataset-element-table/dataset-element-table.component';

@Component({
  selector: 'dataset-element-detail',
  standalone: true,
  imports: [NgForOf, NgIf, DataDisplayComponent, CdkAccordionModule, SharedModule, DatasetElementTableComponent],
  templateUrl: './dataset-element-detail.component.html',
  styleUrl: './dataset-element-detail.component.scss',
})
export class DatasetElementDetailComponent implements OnInit {
  @Input() public layer!: DatasetLayer;
  public layerListData: DataDisplayElement[] = [];

  public ngOnInit() {
    this.layerListData = this.extractLayerListData(this.layer);
  }

  private extractLayerListData(layer: DatasetLayer): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: layer.id, type: 'text'},
      {title: 'Beschreibung', value: layer.description, type: 'text'},
      {title: 'Geometrietyp', value: layer.geometryType, type: 'text'},
      {title: 'Pfad/Filename', value: layer.path, type: 'text'},
      {title: 'Metadaten Sichtbarkeit', value: layer.metadataVisibility, type: 'text'},
      {title: 'Datenbezugsart', value: layer.dataProcurementType, type: 'text'},
    ];
  }
}
