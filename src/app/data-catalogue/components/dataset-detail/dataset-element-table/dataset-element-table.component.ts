import {Component, Input} from '@angular/core';
import {LayerAttributes} from '../../../../shared/interfaces/layer-attributes.interface';
import {NgForOf} from '@angular/common';
import {FormatLineBreaksPipe} from '../../../../shared/pipes/format-line-breaks.pipe';

@Component({
  selector: 'dataset-element-table',
  standalone: true,
  imports: [NgForOf, FormatLineBreaksPipe],
  templateUrl: './dataset-element-table.component.html',
  styleUrl: './dataset-element-table.component.scss',
})
export class DatasetElementTableComponent {
  @Input() public attributes: LayerAttributes[] = [];
}
