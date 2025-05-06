import {Component, Input} from '@angular/core';
import {LayerAttributes} from '../../../../shared/interfaces/layer-attributes.interface';
import {FormatLineBreaksPipe} from '../../../../shared/pipes/format-line-breaks.pipe';
import {TextOrPlaceholderPipe} from '../../../../shared/pipes/text-or-placeholder.pipe';

@Component({
  selector: 'dataset-element-table',
  imports: [FormatLineBreaksPipe, TextOrPlaceholderPipe],
  templateUrl: './dataset-element-table.component.html',
  styleUrl: './dataset-element-table.component.scss',
})
export class DatasetElementTableComponent {
  @Input() public attributes: LayerAttributes[] = [];
  @Input() public name!: string;
}
