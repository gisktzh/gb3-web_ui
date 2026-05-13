import {Component, computed, input} from '@angular/core';
import {DatasetLayer} from '../../../../shared/interfaces/dataset-layer.interface';
import {DataDisplayElement} from '../../../types/data-display-element.type';
import {DataDisplayComponent} from '../../data-display/data-display.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import {SharedModule} from '../../../../shared/shared.module';
import {DatasetElementTableComponent} from '../dataset-element-table/dataset-element-table.component';

@Component({
  selector: 'dataset-element-detail',
  imports: [DataDisplayComponent, CdkAccordionModule, SharedModule, DatasetElementTableComponent],
  templateUrl: './dataset-element-detail.component.html',
  styleUrl: './dataset-element-detail.component.scss',
})
export class DatasetElementDetailComponent {
  public readonly layer = input.required<DatasetLayer>();
  public readonly layerListData = computed<DataDisplayElement[]>(() => [
    {title: 'GIS-ZH Nr.', value: this.layer().id, type: 'text'},
    {title: 'Beschreibung', value: this.layer().description, type: 'text'},
    {title: 'Geometrietyp', value: this.layer().geometryType, type: 'text'},
    {title: 'Pfad/Filename', value: this.layer().path, type: 'text'},
    {title: 'Metadaten Sichtbarkeit', value: this.layer().metadataVisibility, type: 'text'},
    {title: 'Datenbezugsart', value: this.layer().dataProcurementType, type: 'text'},
  ]);
}
