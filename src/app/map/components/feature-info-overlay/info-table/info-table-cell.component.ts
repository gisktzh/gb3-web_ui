import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {TableCell} from './info-table.types';

@Component({
  selector: 'info-table-cell',
  templateUrl: './info-table-cell.component.html',
  styleUrls: ['./info-table-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class InfoTableCellComponent {
  public readonly cellValue = input.required<TableCell>();
}
