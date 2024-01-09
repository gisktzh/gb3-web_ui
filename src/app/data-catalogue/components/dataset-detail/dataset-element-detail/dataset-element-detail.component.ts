import {Component, Input} from '@angular/core';
import {DatasetLayer} from '../../../../shared/interfaces/dataset-layer.interface';
import {NgForOf, NgIf} from '@angular/common';
import {DataDisplayElement} from '../../../types/data-display-element.type';
import {DataCatalogueModule} from '../../../data-catalogue.module';

@Component({
  selector: 'dataset-element-detail',
  standalone: true,
  imports: [NgForOf, NgIf, DataCatalogueModule],
  templateUrl: './dataset-element-detail.component.html',
  styleUrl: './dataset-element-detail.component.scss',
})
export class DatasetElementDetailComponent {
  @Input() public layer?: DatasetLayer;
  public layerListData: DataDisplayElement[] = [];

  // public ngOnInit() {
  //   if (this.layer) {
  //     this.layerListData = this.extractLayerListData(this.layer);
  //   }
  // }

  private extractLayerListData(layer: DatasetLayer): DataDisplayElement[] {
    return [
      {title: 'GIS-ZH Nr.', value: layer.id, type: 'text'},
      {title: 'Beschreibung', value: layer.description, type: 'text'},
      {title: 'geometrietyp', value: layer.geometryType, type: 'text'},
      {title: 'Pfad/Filename', value: layer.path, type: 'text'},
      {title: 'Metadaten Sichtbarkeit', value: layer.metadataVisibility, type: 'text'},
      {title: 'Datenbezugsart', value: layer.dataProcurementType, type: 'text'},
    ];
  }
}
